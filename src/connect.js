const path = require("path");
const fs = require("fs");
const NodeCache = require("node-cache");
const pino = require("pino");
const { onlyNumbers } = require("./utils");
const { getNextPhoneNumber } = require("./queue");
const { generatePairingCode, deletePairingCodeFile } = require("./auth");
const { infoLog, warningLog, errorLog, successLog, sayLog } = require("./logger");
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, proto, makeInMemoryStore, isJidBroadcast, isJidStatusBroadcast, isJidNewsletter } = require("@whiskeysockets/baileys");

const TEMP_DIR = path.resolve(__dirname, "temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

let cachedPhoneNumber = "";
let pairingCodeGenerated = false;

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect(phoneNumberFromIndex = null) {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog("[KRAMPUS] Carpeta 'temp' creada.");
  }

  if (!cachedPhoneNumber) {
    if (phoneNumberFromIndex) {
      cachedPhoneNumber = phoneNumberFromIndex;
      sayLog(`[KRAMPUS] Número recibido desde index.js: ${cachedPhoneNumber}`);
    } else {
      successLog("[Operacion 👻 Marshall] Kram está procesando...");
      while (true) {
        const phone = getNextPhoneNumber();
        if (phone) {
          cachedPhoneNumber = phone;
          break;
        }
        infoLog("[KRAMPUS] Esperando número válido en number_queue.txt...");
        await new Promise((r) => setTimeout(r, 5000));
      }
      sayLog(`[KRAMPUS] Número recibido: ${cachedPhoneNumber}`);
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "assets", "auth", "baileys")
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
      await new Promise((r) => setTimeout(r, 5000));
      if (socket.ws.readyState === socket.ws.OPEN) {
        await generatePairingCode(socket, cachedPhoneNumber);
        pairingCodeGenerated = true;
      } else {
        warningLog("[KRAMPUS] No se puede generar pairing code. Websocket no abierto.");
      }
    } catch (err) {
      errorLog(err);
    }
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (!socket.authState.creds.registered) {
        warningLog("[KRAMPUS] Usuario no vinculado. Esperando...");
        setTimeout(() => {
          connect().then(load);
        }, 5000);
        return;
      }

      switch (statusCode) {
        case DisconnectReason.loggedOut:
          errorLog("Kram desconectado!");
          break;
        case DisconnectReason.badSession:
          warningLog("Sesión no válida!");
          break;
        default:
          warningLog("Desconexión inesperada. Reintentando...");
      }

      const newSocket = await connect();
      load(newSocket);
    } else if (connection === "open") {
      successLog(`[KRAMPUS] Número ${cachedPhoneNumber} vinculado y en línea ✅`);
      pairingCodeGenerated = false;
      deletePairingCodeFile();
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

module.exports = { connect };
