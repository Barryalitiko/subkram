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

const TEMP_DIR = path.resolve(__dirname, "../temp");
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
  // Archivos necesarios
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

  // Crear directorio temp si no existe
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  // Leer número desde number.txt
  if (!fs.existsSync(numberPath)) fs.writeFileSync(numberPath, "", "utf8");

  const rawNumber = fs.readFileSync(numberPath, "utf8").trim();
  if (!rawNumber) {
    warningLog("[KRAMPUS] No hay número en number.txt. Esperando...");
    setTimeout(connect, 5000);
    return;
  }

  // Vaciar number.txt después de leerlo
  fs.writeFileSync(numberPath, "", "utf8");
  const currentNumber = onlyNumbers(rawNumber);
  sayLog(`[KRAMPUS] Número a vincular: ${currentNumber}`);

  // Auth State
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "assets", "auth", "baileys", currentNumber)
  );

  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "error" }),
    printQRInTerminal: false,
    auth: state,
    keepAliveIntervalMs: 60 * 1000,
    defaultQueryTimeoutMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldIgnoreJid: jid =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  store.bind(socket.ev);
  socket.ev.on("creds.update", saveCreds);

  if (!socket.authState.creds.registered) {
    warningLog("Credenciales no configuradas!");

    try {
      const code = await socket.requestPairingCode(currentNumber);
      fs.writeFileSync(pairingCodePath, code, "utf8");
      sayLog(`[KRAMPUS] Código de emparejamiento guardado en pairing_code.txt`);
    } catch (err) {
      const status = err?.output?.statusCode;
      if (status === 428) {
        infoLog("[KRAMPUS] Servidor no listo. Se reintentará.");
      } else {
        errorLog(`Error generando código de emparejamiento: ${err.message}`);
      }
    }
  }

  // Manejo de conexión
  socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;

      if (code === DisconnectReason.loggedOut) {
        errorLog("Krampus desconectado.");
      } else {
        warningLog("Desconexión inesperada, reintentando...");
        setTimeout(() => connect().then(load), 5000);
      }
    } else if (connection === "open") {
      successLog("Krampus vinculado y en línea.");
    } else {
      infoLog("Conectando...");
    }
  });

  return socket;
}

exports.connect = connect;
