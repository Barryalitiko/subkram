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

const TEMP_DIR = path.resolve(__dirname, "../temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

async function connect() {
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");
  const connectedPath = path.join(TEMP_DIR, "connected.json");

  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  // Leer número solo una vez
  let rawNumber;
  try {
    if (!fs.existsSync(numberPath)) fs.writeFileSync(numberPath, "", "utf8");
    rawNumber = fs.readFileSync(numberPath, "utf8").trim();
    if (!rawNumber) {
      warningLog("[KRAMPUS] No hay número en number.txt. Esperando...");
      return setTimeout(connect, 5000); // intenta luego si vacío
    }
    // Vaciar number.txt para evitar múltiples intentos
    fs.writeFileSync(numberPath, "", "utf8");
  } catch (e) {
    errorLog(`[KRAMPUS] Error leyendo number.txt: ${e.message}`);
    return;
  }

  const currentNumber = onlyNumbers(rawNumber);
  sayLog(`[KRAMPUS] Número a vincular: ${currentNumber}`);

  // Auth
  const sessionsDir = path.resolve(__dirname, "../assets/auth/baileys/sessions");
  if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(sessionsDir, currentNumber)
  );
  const { version } = await fetchLatestBaileysVersion();

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

  store.bind(socket.ev);
  load(socket);
  socket.ev.on("creds.update", saveCreds);

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
        pairingRequested = false;
      } else {
        errorLog(`Error generando código de emparejamiento: ${err.message}`);
      }
    }
  };

  return new Promise((resolve, reject) => {
    socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        reconnectAttempts = 0;
        successLog("Krampus vinculado y en línea.");
        if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);

        fs.writeFileSync(
          connectedPath,
          JSON.stringify({ number: currentNumber, connected: true }, null, 2)
        );

        await generatePairCode(); // solo 1 vez tras abrir conexión

        resolve(socket);
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        if (code === DisconnectReason.restartRequired) {
          infoLog('Reinicio requerido, ejecuta "npm start".');
          if (fs.existsSync(connectedPath)) fs.unlinkSync(connectedPath);
          reject(new Error("Restart required"));
        } else if (reconnectAttempts < maxReconnectAttempts) {
          warningLog("Desconexión inesperada, reintentando...");
          reconnectAttempts++;
          setTimeout(async () => resolve(await connect()), 5000);
        } else {
          errorLog("Límite de reintentos alcanzado. Abortando.");
          if (fs.existsSync(connectedPath)) fs.unlinkSync(connectedPath);
          reject(new Error("Max reconnect attempts reached"));
        }
      }
    });
  });
}

exports.connect = connect;
