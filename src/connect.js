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
const {
  warningLog,
  infoLog,
  errorLog,
  sayLog,
  successLog,
} = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

/**
 * Función para procesar el número pendiente (almacenado en number.txt) para iniciar el proceso de conexión.
 */
async function processNumberInternal() {
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const numberPath = path.join(tempDir, "number.txt");
  const pairingCodePath = path.join(tempDir, "pairing_code.txt");

  if (!fs.existsSync(numberPath)) return;

  // Borra cualquier pairing_code residual para evitar reuso
  if (fs.existsSync(pairingCodePath)) {
    console.log("[connect] Se encontró pairing_code.txt anterior. Se borrará.");
    fs.unlinkSync(pairingCodePath);
  }

  const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
  if (!phoneNumber) {
    console.log("[connect] Archivo number.txt vacío. Se elimina.");
    fs.unlinkSync(numberPath);
    return;
  }
  console.log(`[connect] Procesando número: ${phoneNumber}`);

  await processNumberFor(phoneNumber, numberPath, pairingCodePath, authPath);
}

/**
 * Realiza el proceso de conexión para un número dado con un solo intento de obtener el código de emparejamiento.
 */
async function processNumberFor(phoneNumber, numberPath, pairingCodePath, authPath) {
  const subbot = {
    phoneNumber,
    authPath: path.join(authPath, phoneNumber),
    tempFilePath: numberPath,
    codeFilePath: pairingCodePath,
  };

  let connected = false;
  const waitTime = 30000; // 30 segundos de espera para la conexión

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
        isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
      keepAliveIntervalMs: 60 * 1000,
      markOnlineOnConnect: true,
      msgRetryCounterCache,
      shouldSyncHistoryMessage: () => false,
      getMessage,
    });

    // Solicitar código de emparejamiento solo una vez
    if (!fs.existsSync(pairingCodePath)) {
      console.log(`[connect] Solicitando código para ${phoneNumber}`);
      try {
        const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
        fs.writeFileSync(pairingCodePath, code, "utf8");
        console.log(`[connect] Código de emparejamiento generado: ${code}`);
      } catch (err) {
        console.error(`[connect] Error solicitando código para ${phoneNumber}:`, err);
        return; // Terminar proceso si no se obtiene el código
      }
    }

    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        console.log(`[connect] Subbot ${phoneNumber} conectado exitosamente!`);
        connected = true;
        // Limpieza tras conexión exitosa
        if (fs.existsSync(numberPath)) fs.unlinkSync(numberPath);
        if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
      }
      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.warn(`[connect] Conexión cerrada para ${phoneNumber} con código: ${statusCode}`);
        switch (statusCode) {
          case DisconnectReason.loggedOut:
            console.warn(`[connect] Sesión cerrada para ${phoneNumber}`);
            cleanUpSubbotFiles(subbot);
            break;
          case DisconnectReason.badSession:
            console.warn(`[connect] Sesión inválida para ${phoneNumber}`);
            break;
        }
      }
    });

    socket.ev.on("creds.update", saveCreds);

    console.log(`[connect] Esperando ${waitTime / 1000} segundos para que ${phoneNumber} se conecte...`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    if (connected) {
      console.log(`[connect] Conectado exitosamente para ${phoneNumber}`);
    } else {
      console.log(`[connect] No se logró conectar para ${phoneNumber}`);
    }

  } catch (err) {
    console.error(`[connect] Error en el proceso para ${phoneNumber}:`, err);
  }

  // Siempre eliminar el archivo number.txt al final para evitar reintentos con un número ya procesado
  if (fs.existsSync(numberPath)) {
    fs.unlinkSync(numberPath);
    console.log(`[connect] Archivo number.txt eliminado para ${phoneNumber}`);
  }
}

/**
 * Función para limpiar archivos asociados al subbot.
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
 * Función que verifica si hay un nuevo número pendiente en number.txt y lo procesa.
 */
async function processNumber() {
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const numberPath = path.join(tempDir, "number.txt");
  if (!fs.existsSync(numberPath)) {
    return; // No hay número pendiente.
  }
  console.log("[connect] Número detectado. Procesando...");
  await processNumberInternal();
}

/**
 * Función monitor que estará pendiente continuamente de nuevos números enviados por el bot principal.
 * Se invoca cada 5 segundos.
 */
async function connectMonitor() {
  console.log("[connect] Monitor iniciado. Esperando nuevos números...");
  setInterval(async () => {
    await processNumber();
  }, 5000);
}

/**
 * La función principal que se exporta y se encarga de iniciar el monitor.
 */
async function connect() {
  // Inicia el monitor y retorna (el proceso se queda en segundo plano)
  connectMonitor();
}

exports.connect = connect;
