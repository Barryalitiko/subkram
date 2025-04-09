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

/**
 * Función principal para conectar.
 */
async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "assets", "auth", "baileys")
  );

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

  // Leer el número desde number.txt
  const numberPath = path.join(__dirname, "comandos", "temp", "number.txt");
  if (!fs.existsSync(numberPath)) {
    errorLog("El archivo number.txt no existe. Asegúrate de tener el archivo correctamente.");
    process.exit(1);
  }

  const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
  if (!phoneNumber) {
    errorLog("Número de teléfono vacío en number.txt. Asegúrate de colocar un número válido.");
    process.exit(1);
  }

  console.log(`[connect] Procesando número: ${phoneNumber}`);

  // Si no se ha registrado, generamos el código de vinculación y lo guardamos en pairing_code.txt
  if (!socket.authState.creds.registered) {
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

    const pairingCodePath = path.join(__dirname, "comandos", "temp", "pairing_code.txt");
    fs.writeFileSync(pairingCodePath, code, "utf8");
    sayLog(`Código de Emparejamiento: ${code}`);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("Kram desconectado!");
      } else {
        switch (statusCode) {
          case DisconnectReason.badSession:
            warningLog("Sesion no válida!");
            break;
          case DisconnectReason.connectionClosed:
            warningLog("Conexion cerrada!");
            break;
          case DisconnectReason.connectionLost:
            warningLog("Conexion perdida!");
            break;
          case DisconnectReason.connectionReplaced:
            warningLog("Conexion de reemplazo!");
            break;
          case DisconnectReason.multideviceMismatch:
            warningLog("Dispositivo incompatible!");
            break;
          case DisconnectReason.forbidden:
            warningLog("Conexion prohibida!");
            break;
          case DisconnectReason.restartRequired:
            infoLog('Krampus reiniciado! Reinicia con "npm start".');
            break;
          case DisconnectReason.unavailableService:
            warningLog("Servicio no disponible!");
            break;
        }

        const newSocket = await connect();
        load(newSocket);
      }
    } else if (connection === "open") {
      successLog("Operacion Marshall");
    } else {
      infoLog("Cargando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;
