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
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

// Objeto para almacenar los subbots
const subbots = {};

const maxAttempts = 3;
const waitTime = 30000; // 30 segundos
const codeRetryInterval = 15000; // 15 segundos
const maxCodeAttempts = 3;

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const tempDir = path.resolve(__dirname, "comandos", "temp");

  // Leer los archivos de números de teléfono
  const files = fs.readdirSync(tempDir);
  files.forEach((file) => {
    if (file.endsWith(".txt")) {
      const phoneNumber = fs.readFileSync(path.join(tempDir, file), "utf8").trim();
      if (phoneNumber) {
        const subbot = {
          phoneNumber,
          authPath: path.join(authPath, phoneNumber),
          tempFilePath: path.join(tempDir, file),
          codeFilePath: path.join(tempDir, `${phoneNumber}.code.txt`),
        };
        subbots[phoneNumber] = subbot;
        connectSubbot(subbot);
      }
    }
  });

  // Escanear nuevos números cada 5 segundos
  setInterval(() => {
    const files = fs.readdirSync(tempDir);
    files.forEach((file) => {
      if (file.endsWith(".txt")) {
        const phoneNumber = fs.readFileSync(path.join(tempDir, file), "utf8").trim();
        if (phoneNumber && !subbots[phoneNumber]) {
          const subbot = {
            phoneNumber,
            authPath: path.join(authPath, phoneNumber),
            tempFilePath: path.join(tempDir, file),
            codeFilePath: path.join(tempDir, `${phoneNumber}.code.txt`),
          };
          subbots[phoneNumber] = subbot;
          connectSubbot(subbot);
        }
      }
    });
  }, 5000);
}

async function connectSubbot(subbot) {
  let attempts = 0;
  let codeAttempts = 0;

  async function waitForPhoneNumber(subbot) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (subbot.phoneNumber) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  while (attempts < maxAttempts) {
    try {
      await waitForPhoneNumber(subbot);

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

      // Loop de solicitud de códigos
      const requestCodeLoop = async () => {
        while (codeAttempts < maxCodeAttempts) {
          try {
            const code = await socket.requestPairingCode(onlyNumbers(subbot.phoneNumber));
            fs.writeFileSync(subbot.codeFilePath, code, "utf8");
            sayLog(`Código de Emparejamiento para ${subbot.phoneNumber}: ${code}`);
            codeAttempts++;
          } catch (err) {
            errorLog(`Error solicitando código para ${subbot.phoneNumber}:`, err);
          }

          if (codeAttempts >= maxCodeAttempts) {
            errorLog(`Límite de códigos alcanzado para ${subbot.phoneNumber}`);
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, codeRetryInterval));

          // Si el usuario ya se conectó y el archivo fue eliminado, se detiene el bucle
          if (!fs.existsSync(subbot.codeFilePath)) break;
        }
      };

      // Iniciar loop si no está emparejado
      if (!fs.existsSync(subbot.codeFilePath)) {
        requestCodeLoop();
      }

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          successLog(`Subbot ${subbot.phoneNumber} conectado!`);
          if (fs.existsSync(subbot.tempFilePath)) fs.unlinkSync(subbot.tempFilePath);
          if (fs.existsSync(subbot.codeFilePath)) fs.unlinkSync(subbot.codeFilePath);
          return;
        }
        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          switch (statusCode) {
            case DisconnectReason.loggedOut:
              errorLog(`Subbot ${subbot.phoneNumber} desconectado!`);
              break;
            case DisconnectReason.badSession:
              warningLog(`Sesión no válida para ${subbot.phoneNumber}!`);
              break;
          }
        } else if (connection === "connecting") {
          infoLog(`Conectando a WhatsApp...`);
        } else if (connection === "reconnecting") {
          infoLog(`Reconectando a WhatsApp...`);
        } else if (connection === "disconnecting") {
          infoLog(`Desconectando de WhatsApp...`);
        }
      });

      socket.ev.on("creds.update", saveCreds);

      // Tiempo de espera para que se conecte
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      if (socket.isConnected()) {
        successLog(`Subbot ${subbot.phoneNumber} conectado correctamente!`);
        return;
      } else {
        warningLog(`Subbot ${subbot.phoneNumber} no se conectó, intentando de nuevo...`);
      }
    } catch (error) {
      errorLog(`Error al intentar emparejar ${subbot.phoneNumber}:`, error);
    }
    attempts++;
  }

  errorLog(`Subbot ${subbot.phoneNumber} no se conectó después de ${maxAttempts} intentos!`);
}

exports.connect = connect;
