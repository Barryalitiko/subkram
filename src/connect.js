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
  isJidNewsletter, 
  proto, 
  makeInMemoryStore 
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { warningLog, infoLog, errorLog, successLog } = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

// Función para obtener el mensaje
async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

/**
 * Función para procesar el número desde el archivo `number.txt`.
 */
async function processNumber() {
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const numberPath = path.join(tempDir, "number.txt");
  const pairingCodePath = path.join(tempDir, "pairing_code.txt");

  // Si no existe el archivo number.txt, no hace nada
  if (!fs.existsSync(numberPath)) return;

  const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
  if (!phoneNumber) {
    console.log("[connect] Archivo number.txt vacío. Se elimina.");
    fs.unlinkSync(numberPath);
    return;
  }
  console.log(`[connect] Procesando número: ${phoneNumber}`);

  // Si no existe el archivo pairing_code.txt, lo generamos
  if (!fs.existsSync(pairingCodePath)) {
    console.log(`[connect] Solicitando código para ${phoneNumber}`);
    const code = await requestPairingCode(phoneNumber);
    fs.writeFileSync(pairingCodePath, code, "utf8");
    console.log(`[connect] Código de emparejamiento generado: ${code}`);
  }

  // Ahora iniciamos la conexión
  await connectToSocket(phoneNumber, pairingCodePath);
}

/**
 * Solicita el código de emparejamiento para el número de teléfono.
 */
async function requestPairingCode(phoneNumber) {
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
      isJidBroadcast(jid) || 
      isJidStatusBroadcast(jid) || 
      isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  try {
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
    return code;
  } catch (err) {
    errorLog(`[connect] Error solicitando código para ${phoneNumber}:`, err);
    return null;
  }
}

/**
 * Función para realizar la conexión con el número de teléfono.
 */
async function connectToSocket(phoneNumber, pairingCodePath) {
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
      isJidBroadcast(jid) || 
      isJidStatusBroadcast(jid) || 
      isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  // Monitoreamos la actualización de la conexión
  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log(`[connect] Conectado exitosamente con ${phoneNumber}!`);
      if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
    } else if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.warn(`[connect] Conexión cerrada para ${phoneNumber} con código: ${statusCode}`);
    }
  });

  socket.ev.on("creds.update", saveCreds);
}

/**
 * Monitor para verificar el número pendiente y procesarlo.
 */
async function connectMonitor() {
  console.log("[connect] Monitor iniciado. Esperando nuevos números...");
  setInterval(async () => {
    await processNumber();
  }, 5000);
}

/**
 * Función principal que arranca el monitor.
 */
async function connect() {
  connectMonitor(); // Comienza el monitor
}

exports.connect = connect;
