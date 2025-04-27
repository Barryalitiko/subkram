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
  isJidNewsletter 
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { load } = require("./loader");
const { warningLog, infoLog, errorLog, sayLog, successLog } = require("./utils/logger");

const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");
const msgRetryCounterCache = new NodeCache();

async function connect(cloneId = 1) {
  const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

  const CLONE_PREFIX = `[SubBot-${cloneId}]`;
  let cachedPhoneNumber = "";
  let pairingCodeGenerated = false;

  async function getMessage(key) {
    if (!store) return proto.Message.fromObject({});
    const msg = await store.loadMessage(key.remoteJid, key.id);
    return msg ? msg.message : undefined;
  }

  function getNextPhoneNumber() {
    const numberQueuePath = path.join(TEMP_DIR, "number_queue.txt");

    if (!fs.existsSync(numberQueuePath)) {
      fs.writeFileSync(numberQueuePath, "", "utf8");
    }

    const queue = fs.readFileSync(numberQueuePath, "utf8").trim().split("\n").filter(Boolean);
    if (queue.length === 0) return null;

    const number = queue[0];
    fs.writeFileSync(numberQueuePath, queue.slice(1).join("\n"), "utf8");

    return number;
  }

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog(`${CLONE_PREFIX} Carpeta 'temp' creada.`);
  }

  if (!cachedPhoneNumber) {
    successLog(`${CLONE_PREFIX} Operacion 👻 Marshall iniciada...`);
    while (true) {
      try {
        const phoneNumber = getNextPhoneNumber();
        if (phoneNumber) {
          cachedPhoneNumber = phoneNumber;
          break;
        }
        infoLog(`${CLONE_PREFIX} Esperando número válido en number_queue.txt...`);
      } catch (err) {
        warningLog(`${CLONE_PREFIX} Error leyendo number_queue.txt: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
    sayLog(`${CLONE_PREFIX} Número recibido: ${cachedPhoneNumber}`);
  }

  const authFolder = path.resolve(__dirname, "..", "assets", "auth", `baileys-${cloneId}`);
  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
    infoLog(`${CLONE_PREFIX} Carpeta de sesión creada: ${authFolder}`);
  }

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "error" }),
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) => isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt"); // <--- Aquí el cambio

  if (!socket.authState.creds.registered && !pairingCodeGenerated) {
    try {
      const cleanPhoneNumber = onlyNumbers(cachedPhoneNumber);
      await new Promise((r) => setTimeout(r, 5000));
      if (socket.ws.readyState === socket.ws.OPEN) {
        const code = await socket.requestPairingCode(cleanPhoneNumber);
        fs.writeFileSync(pairingCodePath, code, "utf8");
        sayLog(`${CLONE_PREFIX} Código de Emparejamiento generado: ${code}`);
        pairingCodeGenerated = true;
      } else {
        warningLog(`${CLONE_PREFIX} Conexión no establecida. No se puede generar código de vinculación.`);
      }
    } catch (error) {
      errorLog(`${CLONE_PREFIX} Error generando código de emparejamiento: ${error}`);
    }
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (!socket.authState.creds.registered) {
        warningLog(`${CLONE_PREFIX} Usuario aún no ha vinculado. Esperando emparejamiento...`);
        setTimeout(() => {
          connect(cloneId).then((newSocket) => {
            load(newSocket);
          });
        }, 5000);
        return;
      }
      switch (statusCode) {
        case DisconnectReason.loggedOut:
          errorLog(`${CLONE_PREFIX} Kram desconectado!`);
          break;
        case DisconnectReason.badSession:
          warningLog(`${CLONE_PREFIX} Sesión no válida!`);
          break;
        case DisconnectReason.connectionClosed:
          warningLog(`${CLONE_PREFIX} Conexión cerrada!`);
          break;
        case DisconnectReason.connectionLost:
          warningLog(`${CLONE_PREFIX} Conexión perdida!`);
          break;
        case DisconnectReason.connectionReplaced:
          warningLog(`${CLONE_PREFIX} Conexión reemplazada!`);
          break;
        case DisconnectReason.multideviceMismatch:
          warningLog(`${CLONE_PREFIX} Dispositivo incompatible!`);
          break;
        case DisconnectReason.forbidden:
          warningLog(`${CLONE_PREFIX} Conexión prohibida!`);
          break;
        case DisconnectReason.restartRequired:
          infoLog(`${CLONE_PREFIX} Krampus reiniciado! Reinicia con "npm start".`);
          break;
        case DisconnectReason.unavailableService:
          warningLog(`${CLONE_PREFIX} Servicio no disponible!`);
          break;
        default:
          warningLog(`${CLONE_PREFIX} Desconexión inesperada. Reintentando...`);
      }
      const newSocket = await connect(cloneId);
      load(newSocket);
    } else if (connection === "open") {
      successLog(`${CLONE_PREFIX} Operacion Marshall completa. Kram está en línea ✅`);
      pairingCodeGenerated = false;
      if (fs.existsSync(pairingCodePath)) {
        fs.unlinkSync(pairingCodePath);
        infoLog(`${CLONE_PREFIX} pairing_code eliminado tras vinculación.`);
      }
    } else {
      infoLog(`${CLONE_PREFIX} Cargando datos...`);
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;
