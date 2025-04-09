const path = require("path");
const fs = require("fs");
const { onlyNumbers } = require("./utils");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
  makeInMemoryStore,
  isJidNewsletter,
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const {
  warningLog,
  infoLog,
  errorLog,
  sayLog,
  successLog,
} = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const maxAttempts = 3;
const waitTime = 30000;
const codeRetryInterval = 15000;
const maxCodeAttempts = 3;

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const tempDir = path.resolve(__dirname, "comandos", "temp");

  const numberFile = path.join(tempDir, "number.txt");
  const pairingFile = path.join(tempDir, "pairing_code.txt");

  if (!fs.existsSync(numberFile)) {
    errorLog("No se encontró number.txt en el directorio temporal.");
    return;
  }

  const phoneNumber = fs.readFileSync(numberFile, "utf8").trim();
  const authForNumber = path.join(authPath, phoneNumber);
  const codeFileForNumber = path.join(tempDir, `${phoneNumber}.code.txt`);

  let attempts = 0;
  let codeAttempts = 0;

  while (attempts < maxAttempts) {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(authForNumber);
      const { version } = await fetchLatestBaileysVersion();
      const socket = makeWASocket({
        version,
        logger: pino({ level: "error" }),
        printQRInTerminal: false,
        defaultQueryTimeoutMs: 60 * 1000,
        auth: state,
        shouldIgnoreJid: (jid) => isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
        keepAliveIntervalMs: 60 * 1000,
        markOnlineOnConnect: true,
        msgRetryCounterCache,
        shouldSyncHistoryMessage: () => false,
        getMessage,
      });

      if (!fs.existsSync(pairingFile)) {
        while (codeAttempts < maxCodeAttempts) {
          try {
            const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
            fs.writeFileSync(pairingFile, code, "utf8");
            sayLog(`Código de Emparejamiento para ${phoneNumber}: ${code}`);
            break;
          } catch (err) {
            errorLog(`Error solicitando código para ${phoneNumber}:`, err);
            codeAttempts++;
          }
          await new Promise((r) => setTimeout(r, codeRetryInterval));
        }
      }

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          successLog(`Subbot ${phoneNumber} conectado!`);
          if (fs.existsSync(numberFile)) fs.unlinkSync(numberFile);
          if (fs.existsSync(pairingFile)) fs.unlinkSync(pairingFile);
        } else if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          if (statusCode === DisconnectReason.loggedOut) {
            errorLog(`Subbot ${phoneNumber} desconectado!`);
            cleanUp(phoneNumber, authForNumber, numberFile, pairingFile);
          }
        }
      });

      socket.ev.on("creds.update", saveCreds);
      await new Promise((r) => setTimeout(r, waitTime));
      if (socket.isConnected()) {
        successLog(`Subbot ${phoneNumber} conectado correctamente!`);
        return;
      }
    } catch (err) {
      errorLog(`Error conectando subbot ${phoneNumber}:`, err);
    }
    attempts++;
  }

  errorLog(`No se pudo conectar el subbot ${phoneNumber} después de ${maxAttempts} intentos.`);
}

function cleanUp(phoneNumber, authDir, numberFile, pairingFile) {
  if (fs.existsSync(authDir)) fs.rmdirSync(authDir, { recursive: true });
  if (fs.existsSync(numberFile)) fs.unlinkSync(numberFile);
  if (fs.existsSync(pairingFile)) fs.unlinkSync(pairingFile);
  successLog(`Limpieza completa para ${phoneNumber}`);
}

exports.connect = connect;
