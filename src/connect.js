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

// Ruta absoluta compartida para Windows correctamente escrita
const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");

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
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog("[KRAMPUS] Carpeta 'temp' creada.");
  }

  let phoneNumber = "";
  successLog("[Operacion 👻 Marshall] Kram está procesando...");
  while (true) {
    phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
    if (phoneNumber) break;
    infoLog("[KRAMPUS] Esperando número válido en number.txt...");
    await new Promise((r) => setTimeout(r, 5000));
  }

  sayLog(`[KRAMPUS] Número recibido: ${phoneNumber}`);
  fs.writeFileSync(numberPath, "", "utf8");

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

  if (!socket.authState.creds.registered) {
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
    fs.writeFileSync(pairingCodePath, code, "utf8");  // Esta parte es igual al viejo
    sayLog(`[KRAMPUS] Código de Emparejamiento generado: ${code}`);
  }

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
          warningLog("Conexión reemplazada!");
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
          warningLog("Desconexión inesperada. Reintentando...");
      }

      const newSocket = await connect();
      load(newSocket);
    } else if (connection === "open") {
      successLog("Operacion Marshall completa. Kram está en línea ✅");
    } else {
      infoLog("Cargando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;
