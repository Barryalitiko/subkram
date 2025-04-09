const path = require("path");
const fs = require("fs");
const { onlyNumbers } = require("./utils");
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, isJidBroadcast, isJidStatusBroadcast, proto, makeInMemoryStore, isJidNewsletter, } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { warningLog, infoLog, errorLog, sayLog, successLog, } = require("./utils/logger");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }), });

// Objeto para almacenar los subbots
const subbots = {};
const maxAttempts = 3;
const waitTime = 30000; // 30 segundos

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
        // Crear un nuevo subbot
        const subbot = {
          phoneNumber,
          authPath: path.join(authPath, phoneNumber),
          tempFilePath: path.join(tempDir, file),
          codeFilePath: path.join(tempDir, `${phoneNumber}.code.txt`),
        };

        // Agregar el subbot al objeto de subbots
        subbots[phoneNumber] = subbot;

        // Conectar el subbot
        connectSubbot(subbot);
      }
    }
  });

  // Esperar nuevos números de teléfono
  setInterval(() => {
    const files = fs.readdirSync(tempDir);
    files.forEach((file) => {
      if (file.endsWith(".txt")) {
        const phoneNumber = fs.readFileSync(path.join(tempDir, file), "utf8").trim();
        if (phoneNumber && !subbots[phoneNumber]) {
          // Crear un nuevo subbot
          const subbot = {
            phoneNumber,
            authPath: path.join(authPath, phoneNumber),
            tempFilePath: path.join(tempDir, file),
            codeFilePath: path.join(tempDir, `${phoneNumber}.code.txt`),
          };

          // Agregar el subbot al objeto de subbots
          subbots[phoneNumber] = subbot;

          // Conectar el subbot
          connectSubbot(subbot);
        }
      }
    });
  }, 5000);
}

async function connectSubbot(subbot) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(subbot.authPath);
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

      // Solo generar el código si no existe ya uno
      if (!fs.existsSync(subbot.codeFilePath)) {
        const code = await socket.requestPairingCode(onlyNumbers(subbot.phoneNumber));
        fs.writeFileSync(subbot.codeFilePath, code, "utf8");
        sayLog(`Código de Emparejamiento para ${subbot.phoneNumber}: ${code}`);
      }

      // Esperar eventos de conexión
      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          switch (statusCode) {
            case DisconnectReason.loggedOut:
              errorLog(`Subbot ${subbot.phoneNumber} desconectado!`);
              break;
            case DisconnectReason.badSession:
              warningLog(`Sesión no válida para ${subbot.phoneNumber}!`);
              break;
            // ...
          }
        } else if (connection === "open") {
          successLog(`Subbot ${subbot.phoneNumber} conectado!`);
          // Eliminar archivos solo si se emparejó bien
          if (fs.existsSync(subbot.tempFilePath)) fs.unlinkSync(subbot.tempFilePath);
          if (fs.existsSync(subbot.codeFilePath)) fs.unlinkSync(subbot.codeFilePath);
          return;
        } else {
          infoLog(`Cargando datos para ${subbot.phoneNumber}...`);
        }
      });

      socket.ev.on("creds.update", saveCreds);

      // Esperar a que el usuario se conecte
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Verificar si el usuario se conectó
      if (socket.isConnected()) {
        successLog(`Subbot ${subbot.phoneNumber} conectado!`);
        return;
      } else {
        warningLog(`Conexión cerrada para ${subbot.phoneNumber}!`);
      }
    } catch (error) {
      errorLog(`Error al intentar emparejar ${subbot.phoneNumber}:`, error);
    }
    attempts++;
  }
  errorLog(`Subbot ${subbot.phoneNumber} no se conectó después de ${maxAttempts} intentos!`);
}

exports.connect = connect;


