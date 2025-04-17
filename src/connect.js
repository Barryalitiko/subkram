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
    // Pausa de 5 segundos
    await new Promise((r) => setTimeout(r, 5000));

    if (phoneNumbersQueue.length === 0) continue;

    // Tomamos el siguiente número a vincular
    const currentPhoneNumber = phoneNumbersQueue.shift();
    sayLog(`[KRAMPUS] Número recibido: ${currentPhoneNumber}`);

    // Path para credenciales de Baileys
    const sessionsPath = path.resolve(__dirname, "../assets/auth/baileys/sessions");
    if (!fs.existsSync(sessionsPath)) {
      fs.mkdirSync(sessionsPath, { recursive: true });
    }

    // Cargamos estados de autenticación
    const { state, saveCreds } = await useMultiFileAuthState(
      path.join(sessionsPath, currentPhoneNumber)
    );

    // Traemos la versión más reciente de la API
    const { version } = await fetchLatestBaileysVersion();

    // Creamos el socket de WhatsApp
    const socket = makeWASocket({
      version,
      logger: pino({ level: "error" }),
      printQRInTerminal: false,
      defaultQueryTimeoutMs: 60_000,
      auth: state,
      shouldIgnoreJid: (jid) =>
        isJidBroadcast(jid) ||
        isJidStatusBroadcast(jid) ||
        isJidNewsletter(jid),
      keepAliveIntervalMs: 60_000,
      markOnlineOnConnect: true,
      msgRetryCounterCache,
      shouldSyncHistoryMessage: () => false,
      getMessage: async (key) => {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg ? msg.message : undefined;
      },
    });

    // Ligamos el store y el loader al socket
    store.bind(socket.ev);
    load(socket);

    // Guardamos credenciales cuando cambien
    socket.ev.on("creds.update", saveCreds);

    // Devolvemos el socket solo cuando la conexión esté abierta o falle
    return new Promise((resolve, reject) => {
      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        const cleanNumber = onlyNumbers(currentPhoneNumber);

        // Generar código de emparejamiento una sola vez
        if ((connection === "connecting" || qr) && !pairingCodeGenerated[cleanNumber]) {
          try {
            const code = await socket.requestPairingCode(cleanNumber);
            fs.writeFileSync(pairingCodePath, code, "utf8");
            sayLog(`[KRAMPUS] Código de Emparejamiento generado: ${code}`);
            pairingCodeGenerated[cleanNumber] = true;
          } catch (err) {
            errorLog(`Error generando código de emparejamiento: ${err.message}`);
          }
        }

        if (connection === "open") {
          // Conexión exitosa
          reconnectAttempts = 0;
          successLog("Krampus está en línea y vinculado correctamente.");
          if (fs.existsSync(pairingCodePath)) {
            fs.unlinkSync(pairingCodePath);
            infoLog("[KRAMPUS] pairing_code.txt eliminado tras vinculación.");
          }
          resolve(socket);
        }

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          if (statusCode === DisconnectReason.restartRequired) {
            infoLog('Krampus necesita reinicio. Ejecuta "npm start".');
            reject(new Error("Restart required"));
          } else {
            warningLog("Desconexión inesperada de WhatsApp. Reintentando...");
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              setTimeout(async () => {
                try {
                  const newSocket = await connect();
                  resolve(newSocket);
                } catch (e) {
                  reject(e);
                }
              }, 5000);
            } else {
              errorLog("Límite de reintentos alcanzado. Saliendo...");
              reject(new Error("Max reconnect attempts reached"));
            }
          }
        }
      });
    });
  }
}

exports.connect = connect;
