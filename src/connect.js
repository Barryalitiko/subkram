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
const { load } = require("./loader");
const {
  warningLog,
  infoLog,
  errorLog,
  sayLog,
  successLog,
} = require("./utils/logger");

const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

let phoneNumbersQueue = [];
let pairingCodeGenerated = {};
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog("[KRAMPUS] Carpeta 'temp' creada.");
  }

  while (true) {
    try {
      if (!fs.existsSync(numberPath))
        fs.writeFileSync(numberPath, "", "utf8");
      const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
      if (phoneNumber) {
        phoneNumbersQueue.push(phoneNumber);
        fs.writeFileSync(numberPath, "", "utf8");
      }
    } catch (err) {
      warningLog(`[KRAMPUS] Error leyendo number.txt: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 5000));

    if (phoneNumbersQueue.length > 0) {
      const currentPhoneNumber = phoneNumbersQueue.shift();
      sayLog(`[KRAMPUS] Número recibido: ${currentPhoneNumber}`);

      const sessionsPath = path.resolve(
        __dirname,
        "..",
        "assets",
        "auth",
        "baileys",
        "sessions"
      );
      if (!fs.existsSync(sessionsPath)) {
        fs.mkdirSync(sessionsPath, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(
          __dirname,
          "..",
          "assets",
          "auth",
          "baileys",
          "sessions",
          currentPhoneNumber
        )
      );

      const { version } = await fetchLatestBaileysVersion();
      const socket = makeWASocket({
        version,
        logger: pino({ level: "error" }),
        printQRInTerminal: false,
        defaultQueryTimeoutMs: 60 * 1000,
        auth: state,
        shouldIgnoreJid: (jid) =>
          isJidBroadcast(jid) ||
          isJidStatusBroadcast(jid) ||
          isJidNewsletter(jid),
        keepAliveIntervalMs: 60 * 1000,
        markOnlineOnConnect: true,
        msgRetryCounterCache,
        shouldSyncHistoryMessage: () => false,
        getMessage,
      });

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          reconnectAttempts = 0;
          successLog("Operacion Marshall completa. Kram está en línea ");
          if (fs.existsSync(pairingCodePath)) {
            fs.unlinkSync(pairingCodePath);
            infoLog("[KRAMPUS] pairing_code.txt eliminado tras vinculación.");
          }
        } else if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          if (statusCode === DisconnectReason.restartRequired) {
            infoLog('Krampus reiniciado! Reinicia con "npm start".');
          } else {
            warningLog("Desconexión inesperada. Reintentando...");
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              await new Promise((r) => setTimeout(r, 5000));
              const newSocket = await connect();
              load(newSocket);
            } else {
              errorLog(
                "Se alcanzó el límite de intentos de reconexión. Saliendo..."
              );
              process.exit(1);
            }
          }
        }
      });

      socket.ev.on("creds.update", saveCreds);

      if (!socket.authState.creds.registered) {
        try {
          const cleanPhoneNumber = onlyNumbers(currentPhoneNumber);
          await new Promise((r) => setTimeout(r, 5000));
          if (socket.ws.readyState === socket.ws.OPEN) {
            const code = await socket.requestPairingCode(cleanPhoneNumber);
            fs.writeFileSync(pairingCodePath, code, "utf8");
            sayLog(`[KRAMPUS] Código de Emparejamiento generado: ${code}`);
            pairingCodeGenerated[currentPhoneNumber] = true;
          } else {
            warningLog(
              "Conexión no establecida. No se puede generar código de vinculación."
            );
          }
        } catch (error) {
          errorLog(`Error generando código de emparejamiento: ${error}`);
        }
      }

      return socket;
    }
  }
}

exports.connect = connect;