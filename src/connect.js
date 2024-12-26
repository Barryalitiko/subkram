const path = require("path");
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, proto } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { warningLog, infoLog, errorLog, sayLog, successLog } = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();

const store = makeWASocket({
  logger: pino().child({ level: "silent", stream: "store" }),const path = require("path");
const { makeInMemoryStore, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, proto } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { warningLog, infoLog, errorLog, sayLog, successLog } = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();

const store = makeInMemoryStore({
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
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "assets", "auth", "baileys")
  );

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

  if (!socket.authState.creds.registered) {
    warningLog("Credenciales no configuradas!");

    infoLog('Ingrese su numero sin el + (ejemplo: "13733665556"):');

    const phoneNumber = await question("Ingresa el numero: ");

    if (!phoneNumber) {
      errorLog(
        'Numero de telefono inválido! Reinicia con el comando "npm start".'
      );

      process.exit(1);
    }

    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

    sayLog(`Código de pareamiento: ${code}`);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("Bot desconectado!");
      } else {
        warningLog("Conexión cerrada o perdida.");
      }

      // Reintentar conexión
      const newSocket = await connect();
      load(newSocket);
    } else if (connection === "open") {
      successLog("Conexión exitosa");
    } else {
      infoLog("Procesando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

module.exports = connect;

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

    // Verificar si el estado de autenticación y las credenciales están definidos
    if (!state || !state.creds) {
      throw new Error("No se encontraron las credenciales de autenticación. Asegúrese de que los archivos de autenticación estén presentes.");
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
