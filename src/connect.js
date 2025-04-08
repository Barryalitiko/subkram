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

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");

  while (true) {
    const tempDir = path.resolve(__dirname, "comandos", "temp");
    const tempFilePath = path.resolve(tempDir, "number.txt");
    const codeFilePath = path.resolve(tempDir, "pairing_code.txt");

    if (!fs.existsSync(tempFilePath)) {
      warningLog("Archivo de número no encontrado. Esperando...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    let phoneNumber = fs.readFileSync(tempFilePath, "utf8").trim();
    if (!phoneNumber) {
      warningLog("Número no válido. Esperando...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(authPath);
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

      // Solo generar el código si no existe ya uno
      if (!fs.existsSync(codeFilePath)) {
        const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
        fs.writeFileSync(codeFilePath, code, "utf8");
        sayLog(Código de Emparejamiento: ${code});
      }

      // Esperar eventos de conexión
      await new Promise((resolve) => {
        socket.ev.on("connection.update", async (update) => {
          const { connection, lastDisconnect } = update;

          if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            switch (statusCode) {
              case DisconnectReason.loggedOut:
                errorLog("Kram desconectado!");
                break;
              case DisconnectReason.badSession:
                warningLog("Sesión no válida!");
                break;
              case DisconnectReason.connectionClosed:
                warningLog("Conexión cerrada!");
                break;
              case DisconnectReason.connectionLost:
                warningLog("Conexión perdida!");
                break;
              case DisconnectReason.connectionReplaced:
                warningLog("Conexión de reemplazo!");
                break;
              case DisconnectReason.multideviceMismatch:
                warningLog("Dispositivo incompatible!");
                break;
              case DisconnectReason.forbidden:
                warningLog("Conexión prohibida!");
                break;
              case DisconnectReason.restartRequired:
                infoLog('Krampus reiniciado! Reinicia con "npm start".');
                break;
              case DisconnectReason.unavailableService:
                warningLog("Servicio no disponible!");
                break;
              default:
                warningLog("Conexión cerrada inesperadamente.");
                break;
            }

            resolve();
          } else if (connection === "open") {
            successLog("Operacion Marshall");

            // Eliminar archivos solo si se emparejó bien
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);

            resolve();
          } else {
            infoLog("Cargando datos...");
          }
        });
      });

      socket.ev.on("creds.update", saveCreds);
    } catch (error) {
      errorLog("Error al intentar emparejar:", error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    infoLog("Esperando nuevo número...");
  }
}

exports.connect = connect;

