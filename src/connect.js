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

async function connect() {
  let phoneNumber;
  
  // Leer número desde el archivo de forma continua
  while (!phoneNumber) {
    const tempFilePath = path.resolve(__dirname, "comandos", "temp", "number.txt");

    phoneNumber = fs.readFileSync(tempFilePath, "utf8").trim();

    if (!phoneNumber) {
      errorLog('Número de teléfono inválido! Esperando número...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Espera 5 segundos antes de volver a intentar
    }
  }

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

  try {
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
    sayLog(`Código de Emparejamiento: ${code}`);

    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        switch (statusCode) {
          case DisconnectReason.loggedOut:
            errorLog("Kram desconectado!");
            break;
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
          default:
            errorLog("Desconocido, intenta nuevamente.");
            break;
        }

        // Espera y vuelve a leer el número para intentar reconectar
        phoneNumber = null; // Force re-read number
        successLog("Esperando nuevo número...");
      } else if (connection === "open") {
        successLog("Operacion Marshall");
      } else {
        infoLog("Cargando datos...");
      }
    });

    socket.ev.on("creds.update", saveCreds);

  } catch (error) {
    errorLog("Error al intentar emparejar: ", error);
    return connect(); // Si algo falla, vuelve a intentar la conexión
  }

  return socket;
}

exports.connect = connect;
