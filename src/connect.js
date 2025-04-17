const path = require("path");
const fs = require("fs");
const { onlyNumbers } = require("./utils");
const {
  default: makeWASocket,
  DisconnectReason,
  Browsers,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  isJidNewsletter,
  proto,
  makeInMemoryStore,
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

// Directorio temporal para intercambio de datos (número y código)
const TEMP_DIR = path.resolve(__dirname, "../temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

let phoneNumbersQueue = [];
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

async function connect() {
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

  // Crear carpeta temp si no existe
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog("[KRAMPUS] Carpeta 'temp' creada.");
  }

  // Leer número desde archivo en bucle
  while (true) {
    try {
      if (!fs.existsSync(numberPath)) fs.writeFileSync(numberPath, "", "utf8");
      const raw = fs.readFileSync(numberPath, "utf8").trim();
      if (raw) {
        phoneNumbersQueue.push(raw);
        fs.writeFileSync(numberPath, "", "utf8");
        break; // procesar sólo un número
      }
    } catch (err) {
      warningLog(`[KRAMPUS] Error leyendo número: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  const currentNumber = onlyNumbers(phoneNumbersQueue.shift());
  sayLog(`[KRAMPUS] Número a vincular: ${currentNumber}`);

  // Preparar sesión de Baileys
  const sessionsDir = path.resolve(__dirname, "../assets/auth/baileys/sessions");
  if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(sessionsDir, currentNumber)
  );
  const { version } = await fetchLatestBaileysVersion();

  // Crear socket
  const socket = makeWASocket({
    version,
    browser: Browsers.macOS("Chrome"),
    logger: pino({ level: "error" }),
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60_000,
    auth: state,
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60_000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage: async (key) => {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg ? msg.message : undefined;
    },
  });

  // Vincular store y loader
  store.bind(socket.ev);
  load(socket);
  socket.ev.on("creds.update", saveCreds);

  // Si no está registrado, solicitar código de emparejamiento
  if (!socket.authState.creds.registered) {
    try {
      const code = await socket.requestPairingCode(currentNumber);
      fs.writeFileSync(pairingCodePath, code, "utf8");
      sayLog(`[KRAMPUS] Código de emparejamiento: ${code}`);
    } catch (err) {
      errorLog(`Error generando código: ${err.message}`);
    }
  }

  // Esperar apertura o cierre de conexión
  return new Promise((resolve, reject) => {
    socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        reconnectAttempts = 0;
        successLog("Krampus vinculado y en línea.");
        // Eliminar pairing_code.txt si existe
        if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
        resolve(socket);
      }

      if (connection === "close") {
        const status = lastDisconnect?.error?.output?.statusCode;
        if (status === DisconnectReason.restartRequired) {
          infoLog('Reinicio requerido. Ejecuta "npm start".');
          reject(new Error("Restart required"));
        } else if (reconnectAttempts < maxReconnectAttempts) {
          warningLog("Desconexión inesperada, reintentando...");
          reconnectAttempts++;
          setTimeout(async () => {
            try {
              const newSock = await connect();
              resolve(newSock);
            } catch (e) {
              reject(e);
            }
          }, 5000);
        } else {
          errorLog("Límite de reintentos alcanzado. Abortando.");
          reject(new Error("Max reconnect attempts reached"));
        }
      }
    });
  });
}

exports.connect = connect;
