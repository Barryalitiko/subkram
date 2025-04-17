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

// Directorio temporal para intercambio de datos
const TEMP_DIR = path.resolve(__dirname, "../temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

async function connect() {
  // Paths de control
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

  // Crear carpeta temp si no existe
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  // Leer número de archivo
  let rawNumber;
  while (!rawNumber) {
    try {
      if (!fs.existsSync(numberPath)) fs.writeFileSync(numberPath, "", "utf8");
      rawNumber = fs.readFileSync(numberPath, "utf8").trim();
      if (!rawNumber) await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
      warningLog(`[KRAMPUS] Error leyendo número: ${e.message}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  const currentNumber = onlyNumbers(rawNumber);
  sayLog(`[KRAMPUS] Número a vincular: ${currentNumber}`);

  // Preparar estado de auth
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
    auth: state,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 60_000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldIgnoreJid: jid => isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    shouldSyncHistoryMessage: () => false,
    getMessage: async key => {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message;
    }
  });

  // Vincular store y loader
  store.bind(socket.ev);
  load(socket);
  socket.ev.on("creds.update", saveCreds);

  // Función para solicitar pairing code con manejo de error 428
  let pairingRequested = false;
  const generatePairCode = async () => {
    if (pairingRequested) return;
    pairingRequested = true;
    try {
      const code = await socket.requestPairingCode(currentNumber);
      fs.writeFileSync(pairingCodePath, code, "utf8");
      sayLog(`[KRAMPUS] Código de emparejamiento: ${code}`);
    } catch (err) {
      const status = err?.output?.statusCode;
      if (status === 428) {
        infoLog("[KRAMPUS] Servidor no listo, se reintentará al abrir conexión.");
        pairingRequested = false; // permitir retry
      } else {
        errorLog(`Error generando código de emparejamiento: ${err.message}`);
      }
    }
  };

  // Intento inicial
  await generatePairCode();

  // Manejar eventos de conexión
  return new Promise((resolve, reject) => {
    socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        reconnectAttempts = 0;
        successLog("Krampus vinculado y en línea.");
        if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
        resolve(socket);
      }
      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        if (code === DisconnectReason.restartRequired) {
          infoLog('Reinicio requerido, ejecuta "npm start".');
          reject(new Error("Restart required"));
        } else if (reconnectAttempts < maxReconnectAttempts) {
          warningLog("Desconexión inesperada, reintentando...");
          reconnectAttempts++;
          setTimeout(async () => resolve(await connect()), 5000);
        } else {
          errorLog("Límite de reintentos alcanzado. Abortando.");
          reject(new Error("Max reconnect attempts reached"));
        }
      }
    });

    // Reintentar pairing code al abrir ws si falló inicialmente
    socket.ev.on("open", () => {
      if (!pairingRequested) generatePairCode();
    });
  });
}

exports.connect = connect;
