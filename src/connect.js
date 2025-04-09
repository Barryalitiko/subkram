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

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const numberPath = path.join(tempDir, "number.txt");
  const pairingCodePath = path.join(tempDir, "pairing_code.txt");

  if (!fs.existsSync(numberPath)) {
    console.log("[connect] No se encontró el archivo number.txt. Esperando...");
    return setTimeout(connect, 5000); // vuelve a intentarlo
  }

  const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
  if (!phoneNumber) {
    console.log("[connect] El archivo number.txt está vacío.");
    return;
  }

  const subbot = {
    phoneNumber,
    authPath: path.join(authPath, phoneNumber),
    tempFilePath: numberPath,
    codeFilePath: pairingCodePath,
  };

  console.log(`[connect] Iniciando subbot para el número: ${phoneNumber}`);

  let attempts = 0;
  const maxAttempts = 3;
  const waitTime = 30000;
  const codeRetryInterval = 15000;

  while (attempts < maxAttempts) {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(subbot.authPath);
      const { version } = await fetchLatestBaileysVersion();
      const socket = makeWASocket({
        version,
        logger: pino({ level: "error" }),
        printQRInTerminal: false,
        defaultQueryTimeoutMs: 60 * 1000,
        auth: state,
        shouldIgnoreJid: (jid) =>
          isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
        keepAliveIntervalMs: 60 * 1000,
        markOnlineOnConnect: true,
        msgRetryCounterCache,
        shouldSyncHistoryMessage: () => false,
        getMessage,
      });

      let codeAttempts = 0;
      const maxCodeAttempts = 3;

      const requestCodeLoop = async () => {
        while (codeAttempts < maxCodeAttempts) {
          try {
            console.log(`[connect] Solicitando código para ${phoneNumber} (intento ${codeAttempts + 1})`);
            const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
            fs.writeFileSync(pairingCodePath, code, "utf8");
            console.log(`[connect] Código de emparejamiento generado: ${code}`);
            break; // lo logró, salimos
          } catch (err) {
            console.error(`[connect] Error solicitando código:`, err);
          }

          codeAttempts++;
          await new Promise((resolve) => setTimeout(resolve, codeRetryInterval));
        }

        if (codeAttempts >= maxCodeAttempts) {
          console.error(`[connect] No se pudo obtener código después de ${maxCodeAttempts} intentos.`);
        }
      };

      if (!fs.existsSync(pairingCodePath)) {
        await requestCodeLoop();
      }

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
          console.log(`[connect] Subbot conectado exitosamente: ${phoneNumber}`);
          if (fs.existsSync(numberPath)) fs.unlinkSync(numberPath);
          if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
        }

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          console.warn(`[connect] Conexión cerrada con código: ${statusCode}`);

          switch (statusCode) {
            case DisconnectReason.loggedOut:
              console.warn(`[connect] Sesión cerrada para ${phoneNumber}`);
              cleanUpSubbotFiles(subbot);
              break;
            case DisconnectReason.badSession:
              console.warn(`[connect] Sesión inválida para ${phoneNumber}`);
              break;
          }
        }
      });

      socket.ev.on("creds.update", saveCreds);

      await new Promise((resolve) => setTimeout(resolve, waitTime));

      if (socket.isConnected()) {
        console.log(`[connect] Conectado correctamente en el intento ${attempts + 1}`);
        return;
      } else {
        console.log(`[connect] No se logró conectar en el intento ${attempts + 1}`);
      }
    } catch (err) {
      console.error(`[connect] Error en intento ${attempts + 1}:`, err);
    }

    attempts++;
  }

  console.error(`[connect] Fallo total: No se logró conectar después de ${maxAttempts} intentos.`);
}

function cleanUpSubbotFiles(subbot) {
  if (fs.existsSync(subbot.authPath)) {
    fs.rmdirSync(subbot.authPath, { recursive: true });
    console.log(`[cleanUp] Auth eliminada para ${subbot.phoneNumber}`);
  }
  if (fs.existsSync(subbot.tempFilePath)) {
    fs.unlinkSync(subbot.tempFilePath);
    console.log(`[cleanUp] Archivo temporal eliminado para ${subbot.phoneNumber}`);
  }
  if (fs.existsSync(subbot.codeFilePath)) {
    fs.unlinkSync(subbot.codeFilePath);
    console.log(`[cleanUp] Archivo de código eliminado para ${subbot.phoneNumber}`);
  }
}

exports.connect = connect;
