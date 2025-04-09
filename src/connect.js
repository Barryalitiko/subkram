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
const { warningLog, infoLog, errorLog, sayLog, successLog } = require("./utils/logger");

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
 * Extrae el número desde el archivo `number.txt` y maneja el código de emparejamiento.
 */
async function processNumberInternal() {
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const numberPath = path.join(tempDir, "number.txt");
  const pairingCodePath = path.join(tempDir, "pairing_code.txt");

  // Si no existe el archivo number.txt, no hace nada
  if (!fs.existsSync(numberPath)) return;

  // Si existe un código de emparejamiento anterior, lo eliminamos para forzar la creación de uno nuevo
  if (fs.existsSync(pairingCodePath)) {
    console.log("[connect] Se encontró pairing_code.txt anterior. Se borrará.");
    fs.unlinkSync(pairingCodePath);
  }

  // Leemos el número de teléfono desde el archivo
  const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
  if (!phoneNumber) {
    console.log("[connect] Archivo number.txt vacío. Se elimina.");
    fs.unlinkSync(numberPath);
    return;
  }
  console.log(`[connect] Procesando número: ${phoneNumber}`);

  // Llamamos a la función para procesar este número
  await processNumberFor(phoneNumber, numberPath, pairingCodePath, authPath);
}

/**
 * Realiza la conexión con el número de teléfono.
 */
async function processNumberFor(phoneNumber, numberPath, pairingCodePath, authPath) {
  const subbot = {
    phoneNumber,
    authPath: path.join(authPath, phoneNumber),
    tempFilePath: numberPath,
    codeFilePath: pairingCodePath,
  };

  let connected = false;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(subbot.authPath);
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

    // Si no existe un pairing code, lo solicitamos
    if (!fs.existsSync(pairingCodePath)) {
      console.log(`[connect] Solicitando código para ${phoneNumber}`);
      try {
        const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
        fs.writeFileSync(pairingCodePath, code, "utf8");
        console.log(`[connect] Código de emparejamiento generado: ${code}`);
      } catch (err) {
        console.error(`[connect] Error solicitando código para ${phoneNumber}:`, err);
        return; // Terminamos si no conseguimos el código
      }
    }

    // Monitoreamos la actualización de la conexión
    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        console.log(`[connect] Subbot ${phoneNumber} conectado exitosamente!`);
        connected = true;
        // Limpiamos archivos al conectar
        if (fs.existsSync(numberPath)) fs.unlinkSync(numberPath);
        if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
      }
      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.warn(`[connect] Conexión cerrada para ${phoneNumber} con código: ${statusCode}`);
        if (statusCode === DisconnectReason.loggedOut) {
          console.warn(`[connect] Sesión cerrada para ${phoneNumber}`);
          cleanUpSubbotFiles(subbot);
        }
      }
    });

    socket.ev.on("creds.update", saveCreds);

    // Verificamos si se logró la conexión sin esperar
    if (connected) {
      console.log(`[connect] Conectado exitosamente para ${phoneNumber}`);
    } else {
      console.log(`[connect] No se logró conectar para ${phoneNumber}`);
    }

  } catch (err) {
    console.error(`[connect] Error en el proceso para ${phoneNumber}:`, err);
  }

  // Siempre eliminar el archivo number.txt al final
  if (fs.existsSync(numberPath)) {
    fs.unlinkSync(numberPath);
    console.log(`[connect] Archivo number.txt eliminado para ${phoneNumber}`);
  }
}

/**
 * Limpiar archivos del subbot
 */
function cleanUpSubbotFiles(subbot) {
  if (fs.existsSync(subbot.authPath)) {
    fs.rmdirSync(subbot.authPath, { recursive: true });
    console.log(`[cleanUp] Directorio de autenticación eliminado para ${subbot.phoneNumber}`);
  }
  if (fs.existsSync(subbot.tempFilePath)) {
    fs.unlinkSync(subbot.tempFilePath);
    console.log(`[cleanUp] Archivo number.txt eliminado para ${subbot.phoneNumber}`);
  }
  if (fs.existsSync(subbot.codeFilePath)) {
    fs.unlinkSync(subbot.codeFilePath);
    console.log(`[cleanUp] Archivo de pairing code eliminado para ${subbot.phoneNumber}`);
  }
}

/**
 * Función principal que verifica y procesa el número pendiente
 */
async function processNumber() {
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const numberPath = path.join(tempDir, "number.txt");
  if (!fs.existsSync(numberPath)) return; // No hay número pendiente
  console.log("[connect] Número detectado. Procesando...");
  await processNumberInternal();
}

/**
 * Función monitor que estará pendiente continuamente de nuevos números enviados por el bot principal
 */
async function connectMonitor() {
  console.log("[connect] Monitor iniciado. Esperando nuevos números...");
  setInterval(async () => {
    await processNumber();
  }, 5000);
}

/**
 * Función principal que arranca el monitor
 */
async function connect() {
  connectMonitor(); // Comienza el monitor
}

exports.connect = connect;
