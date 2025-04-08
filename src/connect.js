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

async function connectSubbot(phoneNumber) {
  const onlyNum = onlyNumbers(phoneNumber);
  const authPath = path.resolve(__dirname, "..", "assets", "auth", `sub-${onlyNum}`);
  const tempDir = path.resolve(__dirname, "comandos", "temp");
  const codeFilePath = path.resolve(tempDir, `${onlyNum}_code.txt`);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
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

    if (!fs.existsSync(codeFilePath)) {
      const code = await socket.requestPairingCode(onlyNum);
      fs.writeFileSync(codeFilePath, code, "utf8");
      sayLog(`[${onlyNum}] Código de Emparejamiento: ${code}`);
    }

    await new Promise((resolve) => {
      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;

          warningLog(`[${onlyNum}] Desconectado (${statusCode})`);
          resolve();
        } else if (connection === "open") {
          successLog(`[${onlyNum}] Subbot emparejado exitosamente`);

          if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);

          resolve();
        } else {
          infoLog(`[${onlyNum}] Estado: ${connection}`);
        }
      });
    });

    socket.ev.on("creds.update", saveCreds);
  } catch (err) {
    errorLog(`[${onlyNum}] Error en subbot:`, err);
  }
}

exports.connectSubbot = connectSubbot;
