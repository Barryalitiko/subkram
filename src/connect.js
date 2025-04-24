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

const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
const generatedCodes = new Set(); // Evitar duplicar códigos
const activeBots = {}; // Instancias activas

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

// Obtiene siguiente número de la cola
function getNextPhoneNumber() {
  const queuePath = path.join(TEMP_DIR, "number_queue.txt");
  if (!fs.existsSync(queuePath)) fs.writeFileSync(queuePath, "", "utf8");
  const lines = fs.readFileSync(queuePath, "utf8").split("\n").filter(Boolean);
  if (lines.length === 0) return null;
  const [number, ...rest] = lines;
  fs.writeFileSync(queuePath, rest.join("\n"), "utf8");
  return number;
}

// Crea o recupera instancia de bot
async function createBotInstance(phoneNumber) {
  if (activeBots[phoneNumber]) return activeBots[phoneNumber];
  infoLog(`[KRAMPUS] Inicializando subbot para ${phoneNumber}...`);
  const socket = await launchConnection(phoneNumber);
  activeBots[phoneNumber] = socket;
  return socket;
}

// Lógica de conexión para un número específico
async function launchConnection(phoneNumber) {
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");
  const cleanNumber = onlyNumbers(phoneNumber);

  // Preparar auth state
  const authDir = path.resolve(__dirname, "..", "assets", "auth", "baileys", cleanNumber);
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "error" }),
    printQRInTerminal: false,
    auth: state,
    shouldIgnoreJid: jid => isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  // Generar código si no registrado y no duplicado
  if (!socket.authState.creds.registered && !generatedCodes.has(cleanNumber)) {
    try {
      await new Promise(r => setTimeout(r, 5000));
      if (socket.ws.readyState === socket.ws.OPEN) {
        const code = await socket.requestPairingCode(cleanNumber);
        fs.writeFileSync(pairingCodePath, code, "utf8");
        sayLog(`[KRAMPUS ${cleanNumber}] Código generado: ${code}`);
        generatedCodes.add(cleanNumber);
      }
    } catch (err) {
      errorLog(`[KRAMPUS ${cleanNumber}] Error al generar código: ${err.message}`);
    }
  }

  socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      successLog(`[KRAMPUS ${cleanNumber}] Conectado ✅`);
      if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
    } else if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (!socket.authState.creds.registered) {
        warningLog(`[KRAMPUS ${cleanNumber}] No vinculado, reintentando...`);
        setTimeout(() => createBotInstance(phoneNumber), 5000);
      } else {
        warningLog(`[KRAMPUS ${cleanNumber}] Desconexión inesperada (${code}), cerrando.`);
        delete activeBots[phoneNumber];
      }
    }
  });

  socket.ev.on("creds.update", saveCreds);
  return socket;
}

// Ciclo principal para múltiples subbots
async function connect() {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
  infoLog("[KRAMPUS] Iniciando monitor de número...");
  while (true) {
    const number = getNextPhoneNumber();
    if (number) {
      sayLog(`[KRAMPUS] Nuevo número: ${number}`);
      await createBotInstance(number);
    } else {
      infoLog("[KRAMPUS] Sin números en cola, esperando...");
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

exports.connect = connect;
