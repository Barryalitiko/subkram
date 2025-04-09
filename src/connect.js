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
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

/**
 * Función que procesa el archivo number.txt y trata de conectar el subbot.
 * Una vez procesado (con éxito o fallo), se limpian los archivos asociados para evitar reintentos con números anteriores.
 */
async function processNumber() {
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const numberPath = path.join(tempDir, "number.txt");
  const pairingCodePath = path.join(tempDir, "pairing_code.txt");

  if (!fs.existsSync(numberPath)) {
    // No hay un número pendiente.
    return;
  }

  const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
  if (!phoneNumber) {
    console.log("[connect] El archivo number.txt está vacío. Se elimina.");
    fs.unlinkSync(numberPath);
    return;
  }

  const subbot = {
    phoneNumber,
    authPath: path.join(authPath, phoneNumber),
    tempFilePath: numberPath,
    codeFilePath: pairingCodePath,
  };

  console.log(`[connect] Iniciando subbot para el número: ${phoneNumber}`);

  let attempts = 0;
  const maxAttempts = 3;
  const waitTime = 30000;       // 30 segundos para esperar la conexión
  const codeRetryInterval = 15000; // 15 segundos entre solicitudes de código

  let connected = false;

  while (attempts < maxAttempts && !connected) {
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

      let codeAttempts = 0;
      const maxCodeAttempts = 3;
      const requestCodeLoop = async () => {
        while (codeAttempts < maxCodeAttempts) {
          try {
            console.log(`[connect] Solicitando código para ${phoneNumber} (intento ${codeAttempts + 1})`);
            const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
            fs.writeFileSync(pairingCodePath, code, "utf8");
            console.log(`[connect] Código de emparejamiento generado: ${code}`);
            break; // Obtuvo el código, sal del loop.
          } catch (err) {
            console.error(`[connect] Error solicitando código para ${phoneNumber}:`, err);
          }
          codeAttempts++;
          await new Promise((resolve) => setTimeout(resolve, codeRetryInterval));
        }
        if (codeAttempts >= maxCodeAttempts) {
          console.error(`[connect] No se pudo obtener código después de ${maxCodeAttempts} intentos para ${phoneNumber}.`);
        }
      };

      if (!fs.existsSync(pairingCodePath)) {
        await requestCodeLoop();
      }

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          console.log(`[connect] Subbot ${phoneNumber} conectado exitosamente!`);
          connected = true;
          // Limpieza de archivos tras conexión exitosa.
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
        console.log(`[connect] Conexión exitosa en el intento ${attempts + 1} para ${phoneNumber}`);
        break;
      } else {
        console.log(`[connect] No se logró conectar en el intento ${attempts + 1} para ${phoneNumber}`);
      }
    } catch (err) {
      console.error(`[connect] Error en intento ${attempts + 1} para ${phoneNumber}:`, err);
    }
    attempts++;
  }

  if (!connected) {
    console.error(`[connect] Fallo total: No se logró conectar el subbot ${phoneNumber} después de ${maxAttempts} intentos.`);
    cleanUpSubbotFiles(subbot);
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
 * Función que monitorea continuamente la carpeta temporal en busca de un nuevo número.
 */
async function connectMonitor() {
  console.log("[connect] Monitor iniciado. Esperando nuevos números...");
  setInterval(async () => {
    await processNumber();
  }, 5000);
}

/**
 * Función que procesa el número y genera la conexión.
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
 * Función interna que ejecuta el procesamiento del número.
 */
async function processNumberInternal() {
  // Se reutiliza la lógica de processNumber descrita anteriormente.
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const numberPath = path.join(tempDir, "number.txt");
  const pairingCodePath = path.join(tempDir, "pairing_code.txt");

  if (!fs.existsSync(numberPath)) return;
  
  // Si ya existe el pairing code de un intento anterior, se borra para evitar reintentos con el mismo número.
  if (fs.existsSync(pairingCodePath)) {
    console.log("[connect] Se encontró un pairing_code.txt anterior. Se borrará.");
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
 * Función que intenta conectar un subbot para un número dado.
 */
async function processNumberFor(phoneNumber, numberPath, pairingCodePath, authPath) {
  const subbot = {
    phoneNumber,
    authPath: path.join(authPath, phoneNumber),
    tempFilePath: numberPath,
    codeFilePath: pairingCodePath,
  };

  let attempts = 0;
  const maxAttempts = 3;
  const waitTime = 30000;
  const codeRetryInterval = 15000;
  let connected = false;

  while (attempts < maxAttempts && !connected) {
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
      
      let codeAttempts = 0;
      const maxCodeAttempts = 3;
      const requestCodeLoop = async () => {
        while (codeAttempts < maxCodeAttempts) {
          try {
            console.log(`[connect] Solicitando código para ${phoneNumber} (intento ${codeAttempts + 1})`);
            const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
            fs.writeFileSync(pairingCodePath, code, "utf8");
            console.log(`[connect] Código de emparejamiento generado: ${code}`);
            break;
          } catch (err) {
            console.error(`[connect] Error solicitando código para ${phoneNumber}:`, err);
          }
          codeAttempts++;
          await new Promise((resolve) => setTimeout(resolve, codeRetryInterval));
        }
        if (codeAttempts >= maxCodeAttempts) {
          console.error(`[connect] No se pudo obtener código después de ${maxCodeAttempts} intentos para ${phoneNumber}.`);
        }
      };

      if (!fs.existsSync(pairingCodePath)) {
        await requestCodeLoop();
      }

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          console.log(`[connect] Subbot ${phoneNumber} conectado exitosamente!`);
          connected = true;
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
        console.log(`[connect] Conectado exitosamente en el intento ${attempts + 1} para ${phoneNumber}`);
        break;
      } else {
        console.log(`[connect] No se logró conectar en el intento ${attempts + 1} para ${phoneNumber}`);
      }
    } catch (err) {
      console.error(`[connect] Error en intento ${attempts + 1} para ${phoneNumber}:`, err);
    }
    attempts++;
  }

  if (!connected) {
    console.error(`[connect] Fallo total: No se logró conectar el subbot ${phoneNumber} después de ${maxAttempts} intentos.`);
    cleanUpSubbotFiles(subbot);
  }
}

/**
 * Limpia los archivos asociados al subbot.
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
 * Función monitor que estará pendiente continuamente de nuevos números enviados por el principal.
 */
async function connect() {
  console.log("[connect] Monitor iniciado. Esperando nuevos números...");
  setInterval(async () => {
    await processNumber();
  }, 5000);
}

exports.connect = connect;
