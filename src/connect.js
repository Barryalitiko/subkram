// services/connect.js
const path = require("path");
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, proto } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { warningLog, infoLog, errorLog, sayLog, successLog } = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();

const store = makeWASocket({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function getMessage(key) {
  if (!store) {
    return proto.Message.fromObject({});
  }

  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      path.resolve(__dirname, "..", "assets", "auth", "baileys")
    );

    // Verificar si los datos de autenticación existen
    if (!state || !state.creds) {
      throw new Error("No se encontraron las credenciales de autenticación.");
    }

    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      logger: pino({ level: "error" }),
      printQRInTerminal: false,
      auth: state,
      keepAliveIntervalMs: 60 * 1000,
      markOnlineOnConnect: true,
      msgRetryCounterCache,
      shouldSyncHistoryMessage: () => false,
      getMessage,
    });

    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        const statusCode = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (statusCode === DisconnectReason.loggedOut) {
          errorLog("Bot desconectado!");
        } else {
          warningLog("Conexión cerrada o perdida.");
        }

        // Reintentar conexión
        await connect();
      } else if (connection === "open") {
        successLog("Conexión exitosa");
      } else {
        infoLog("Procesando datos...");
      }
    });

    socket.ev.on("creds.update", saveCreds);

    return socket;
  } catch (error) {
    errorLog("Error al conectar:", error);
    process.exit(1);
  }
}

module.exports = connect;
