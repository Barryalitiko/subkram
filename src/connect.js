const path = require("path");
const fs = require("fs");
const { onlyNumbers } = require("./utils");
const {
  default: makeWASocket,
  Browsers,
  DisconnectReason,
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
let pairingCodeGenerated = {};
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

async function connect() {
  // Rutas de los archivos de control
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

  // Aseguramos que exista el directorio temp
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog("[KRAMPUS] Carpeta 'temp' creada.");
  }

  // Ciclo de espera activa: lee número cada 5s
  while (true) {
    try {
      if (!fs.existsSync(numberPath)) fs.writeFileSync(numberPath, "", "utf8");
      const rawNumber = fs.readFileSync(numberPath, "utf8").trim();
      if (rawNumber) {
        phoneNumbersQueue.push(rawNumber);
        fs.writeFileSync(numberPath, "", "utf8");
      }
    } catch (err) {
      warningLog(`[KRAMPUS] Error leyendo number.txt: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 5000));

    if (!phoneNumbersQueue.length) continue;
    const currentPhoneNumber = phoneNumbersQueue.shift();
    sayLog(`[KRAMPUS] Número recibido: ${currentPhoneNumber}`);

    // Cargamos estados de autenticación
    const sessionsDir = path.resolve(__dirname, "../assets/auth/baileys/sessions");
    if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(
      path.join(sessionsDir, currentPhoneNumber)
    );
    const { version } = await fetchLatestBaileysVersion();

    // Creamos el socket con configuración de navegador válida para emparejamiento
    const socket = makeWASocket({
      version,
      browser: Browsers.macOS("Chrome"),
      logger: pino({ level: "error" }),
      auth: state,
      printQRInTerminal: false,
      defaultQueryTimeoutMs: 60_000,
      msgRetryCounterCache,
      shouldIgnoreJid: (jid) =>
        isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
      markOnlineOnConnect: true,
      keepAliveIntervalMs: 60_000,
      shouldSyncHistoryMessage: () => false,
      getMessage: async (key) => {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg ? msg.message : undefined;
      },
    });

    // Vinculamos el store y el loader
    store.bind(socket.ev);
    load(socket);
    socket.ev.on("creds.update", saveCreds);

    // Devolvemos el socket cuando cambie el estado
    return new Promise((resolve, reject) => {
      socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        const cleanNumber = onlyNumbers(currentPhoneNumber);

        // Solo solicitar pairing code tras QR o reconexión inicial y con ws abierto
        if ((qr || connection === "connecting") && !pairingCodeGenerated[cleanNumber] && socket.ws.readyState === socket.ws.OPEN) {
          try {
            const code = await socket.requestPairingCode(cleanNumber);
            fs.writeFileSync(pairingCodePath, code, "utf8");
            sayLog(`[KRAMPUS] Código de emparejamiento: ${code}`);
            pairingCodeGenerated[cleanNumber] = true;
          } catch (err) {
            errorLog(`Error generando código de emparejamiento: ${err.message}`);
          }
        }

        if (connection === "open") {
          reconnectAttempts = 0;
          successLog("Krampus vinculado correctamente y en línea.");
          if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
          resolve(socket);
        }

        if (connection === "close") {
          const status = lastDisconnect?.error?.output?.statusCode;
          if (status === DisconnectReason.restartRequired) {
            infoLog('Reinicio requerido, ejecuta "npm start".');
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
            errorLog("Límite de reintentos alcanzado, saliendo.");
            reject(new Error("Max reconnect attempts reached"));
          }
        }
      });
    });
  }
}

exports.connect = connect;
