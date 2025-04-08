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

async function connectSubbot(phoneNumber) {
  const onlyNum = onlyNumbers(phoneNumber);
  // Cada subbot tendrá su propia carpeta de autenticación
  const authPath = path.resolve(__dirname, "..", "assets", "auth", `sub-${onlyNum}`);
  // En la carpeta de temp se almacenarán los archivos específicos para cada subbot
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  // Utilizamos un nombre de archivo que incluya el número para evitar colisiones
  const codeFilePath = path.resolve(tempDir, `${onlyNum}_code.txt`);

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
        isJidBroadcast(jid) ||
        isJidStatusBroadcast(jid) ||
        isJidNewsletter(jid),
      keepAliveIntervalMs: 60 * 1000,
      markOnlineOnConnect: true,
      msgRetryCounterCache,
      shouldSyncHistoryMessage: () => false,
      getMessage,
    });

    // Si no existe ya un código generado, solicitarlo
    if (!fs.existsSync(codeFilePath)) {
      const code = await socket.requestPairingCode(onlyNum);
      fs.writeFileSync(codeFilePath, code, "utf8");
      sayLog(`[${onlyNum}] Código de Emparejamiento: ${code}`);
    }

    // Esperar a que se actualice la conexión y actuar según el estado
    await new Promise((resolve) => {
      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          switch (statusCode) {
            case DisconnectReason.loggedOut:
              errorLog(`[${onlyNum}] Subbot desconectado (loggedOut)!`);
              break;
            case DisconnectReason.badSession:
              warningLog(`[${onlyNum}] Sesión no válida!`);
              break;
            case DisconnectReason.connectionClosed:
              warningLog(`[${onlyNum}] Conexión cerrada!`);
              break;
            case DisconnectReason.connectionLost:
              warningLog(`[${onlyNum}] Conexión perdida!`);
              break;
            case DisconnectReason.connectionReplaced:
              warningLog(`[${onlyNum}] Conexión de reemplazo!`);
              break;
            case DisconnectReason.multideviceMismatch:
              warningLog(`[${onlyNum}] Dispositivo incompatible!`);
              break;
            case DisconnectReason.forbidden:
              warningLog(`[${onlyNum}] Conexión prohibida!`);
              break;
            case DisconnectReason.restartRequired:
              infoLog(`[${onlyNum}] Subbot reiniciado! Reinicia con "npm start".`);
              break;
            case DisconnectReason.unavailableService:
              warningLog(`[${onlyNum}] Servicio no disponible!`);
              break;
            default:
              warningLog(`[${onlyNum}] Conexión cerrada inesperadamente.`);
              break;
          }
          // Si la conexión se cierra, se finaliza esta instancia (se reiniciará desde el principal o se descartará)
          resolve();
        } else if (connection === "open") {
          successLog(`[${onlyNum}] Subbot emparejado exitosamente.`);
          // Si se empareja bien, eliminar el archivo con el código
          if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);
          resolve();
        } else {
          infoLog(`[${onlyNum}] Estado: ${connection}`);
        }
      });
    });

    socket.ev.on("creds.update", saveCreds);
  } catch (err) {
    errorLog(`[${onlyNum}] Error en subbot:`, err);
  }
}

exports.connectSubbot = connectSubbot;
