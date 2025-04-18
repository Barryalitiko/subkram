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
  successLog 
} = require("./utils/logger");

const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect(phoneId) {
  const numberPath = path.join(TEMP_DIR, `number_${phoneId}.txt`);
  const pairingCodePath = path.join(TEMP_DIR, `pairing_code_${phoneId}.txt`);
  let cachedPhoneNumber = "";
  let pairingCodeGenerated = false;

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog(`[KRAMPUS-${phoneId}] Carpeta 'temp' creada.`);
  }

  successLog(`[Operacion 👻 Marshall-${phoneId}] Kram está procesando...`);
  while (true) {
    try {
      if (!fs.existsSync(numberPath)) fs.writeFileSync(numberPath, "", "utf8");
      const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
      if (phoneNumber) {
        cachedPhoneNumber = phoneNumber;
        break;
      }
      infoLog(`[KRAMPUS-${phoneId}] Esperando número válido en ${numberPath}...`);
    } catch (err) {
      warningLog(`[KRAMPUS-${phoneId}] Error leyendo ${numberPath}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  sayLog(`[KRAMPUS-${phoneId}] Número recibido: ${cachedPhoneNumber}`);
  fs.writeFileSync(numberPath, "", "utf8");

  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "assets", "auth", `baileys_${phoneId}`)
  );
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

  if (!socket.authState.creds.registered && !pairingCodeGenerated) {
    try {
      const cleanPhoneNumber = onlyNumbers(cachedPhoneNumber);
      await new Promise((r) => setTimeout(r, 5000));
      if (socket.ws.readyState === socket.ws.OPEN) {
        const code = await socket.requestPairingCode(cleanPhoneNumber);
        fs.writeFileSync(pairingCodePath, code, "utf8");
        sayLog(`[KRAMPUS-${phoneId}] Código de Emparejamiento generado: ${code}`);
        pairingCodeGenerated = true;
      } else {
        warningLog(`[KRAMPUS-${phoneId}] Conexión no establecida. No se puede generar código de vinculación.`);
      }
    } catch (error) {
      errorLog(`[KRAMPUS-${phoneId}] Error generando código de emparejamiento: ${error}`);
    }
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (!socket.authState.creds.registered) {
        warningLog(`[KRAMPUS-${phoneId}] Usuario aún no ha vinculado. Esperando emparejamiento...`);
        setTimeout(() => {
          connect(phoneId).then((newSocket) => {
            load(newSocket);
          });
        }, 5000);
        return;
      }
      switch (statusCode) {
        case DisconnectReason.loggedOut:
          errorLog(`[KRAMPUS-${phoneId}] Desconectado!`);
          break;
        case DisconnectReason.badSession:
          warningLog(`[KRAMPUS-${phoneId}] Sesión no válida!`);
          break;
        case DisconnectReason.connectionClosed:
          warningLog(`[KRAMPUS-${phoneId}] Conexión cerrada!`);
          break;
        case DisconnectReason.connectionLost:
          warningLog(`[KRAMPUS-${phoneId}] Conexión perdida!`);
          break;
        case DisconnectReason.connectionReplaced:
          warningLog(`[KRAMPUS-${phoneId}] Conexión reemplazada!`);
          break;
        case DisconnectReason.multideviceMismatch:
          warningLog(`[KRAMPUS-${phoneId}] Dispositivo incompatible!`);
          break;
        case DisconnectReason.forbidden:
          warningLog(`[KRAMPUS-${phoneId}] Conexión prohibida!`);
          break;
        case DisconnectReason.restartRequired:
          infoLog(`[KRAMPUS-${phoneId}] Reiniciado! Reinicia con 'npm start'.`);
          break;
        case DisconnectReason.unavailableService:
          warningLog(`[KRAMPUS-${phoneId}] Servicio no disponible!`);
          break;
        default:
          warningLog(`[KRAMPUS-${phoneId}] Desconexión inesperada. Reintentando...`);
      }
      const newSocket = await connect(phoneId);
      load(newSocket);
    } else if (connection === "open") {
      successLog(`[KRAMPUS-${phoneId}] Operacion Marshall completa. Kram está en línea ✅`);
      pairingCodeGenerated = false;
      if (fs.existsSync(pairingCodePath)) {
        fs.unlinkSync(pairingCodePath);
        infoLog(`[KRAMPUS-${phoneId}] pairing_code.txt eliminado tras vinculación.`);
      }
    } else {
      infoLog(`[KRAMPUS-${phoneId}] Cargando datos...`);
    }
  });

  socket.ev.on("creds.update", saveCreds);
  return socket;
}

exports.connect = connect;
