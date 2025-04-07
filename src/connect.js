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

async function connect() {
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");

  while (true) {
    const tempDir = path.resolve(__dirname, "comandos", "temp");
    const tempFilePath = path.resolve(tempDir, "number.txt");
    const codeFilePath = path.resolve(tempDir, "pairing_code.txt");

    if (!fs.existsSync(tempFilePath)) {
      warningLog("Archivo de número no encontrado. Esperando...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    let phoneNumber = fs.readFileSync(tempFilePath, "utf8").trim();
    if (!phoneNumber) {
      warningLog("Número no válido. Esperando...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    // Contador de intentos fallidos (máximo 5 intentos)
    const attemptFilePath = path.resolve(tempDir, `${phoneNumber}_attempts.txt`);
    let attempts = 0;

    if (fs.existsSync(attemptFilePath)) {
      attempts = parseInt(fs.readFileSync(attemptFilePath, "utf8").trim(), 10);
    }

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

      // Solo generar el código si no existe ya uno
      if (!fs.existsSync(codeFilePath)) {
        const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
        fs.writeFileSync(codeFilePath, code, "utf8");
        sayLog(`Código de Emparejamiento para ${phoneNumber}: ${code}`);
      }

      // Esperar eventos de conexión
      await new Promise((resolve) => {
        socket.ev.on("connection.update", async (update) => {
          const { connection, lastDisconnect } = update;

          if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            // Si el número ha fallado demasiadas veces, lo eliminamos
            if (attempts >= 5) {
              errorLog(`El número ${phoneNumber} ha fallado demasiadas veces. Eliminando...`);
              const subbotDir = path.resolve(tempDir, phoneNumber);
              if (fs.existsSync(subbotDir)) {
                fs.rmdirSync(subbotDir, { recursive: true });
              }
              resolve();
              return;
            }

            switch (statusCode) {
              case DisconnectReason.loggedOut:
                errorLog(`Subbot ${phoneNumber} desconectado!`);
                break;
              case DisconnectReason.badSession:
                warningLog(`Sesión no válida para ${phoneNumber}!`);
                break;
              case DisconnectReason.connectionClosed:
                warningLog(`Conexión cerrada para ${phoneNumber}!`);
                break;
              case DisconnectReason.connectionLost:
                warningLog(`Conexión perdida para ${phoneNumber}!`);
                break;
              case DisconnectReason.connectionReplaced:
                warningLog(`Conexión de reemplazo para ${phoneNumber}!`);
                break;
              case DisconnectReason.multideviceMismatch:
                warningLog(`Dispositivo incompatible para ${phoneNumber}!`);
                break;
              case DisconnectReason.forbidden:
                warningLog(`Conexión prohibida para ${phoneNumber}!`);
                break;
              case DisconnectReason.restartRequired:
                infoLog(`Subbot ${phoneNumber} reiniciado! Reinicia con "npm start".`);
                break;
              case DisconnectReason.unavailableService:
                warningLog(`Servicio no disponible para ${phoneNumber}!`);
                break;
              default:
                warningLog(`Conexión cerrada inesperadamente para ${phoneNumber}.`);
                break;
            }

            // Incrementar el contador de intentos
            attempts++;
            fs.writeFileSync(attemptFilePath, attempts.toString(), "utf8");

            resolve();
          } else if (connection === "open") {
            successLog(`Subbot ${phoneNumber} conectado con éxito.`);

            // Eliminar archivos solo si se emparejó bien
            const subbotDir = path.resolve(tempDir, phoneNumber);
            if (fs.existsSync(subbotDir)) {
              fs.unlinkSync(path.resolve(subbotDir, "number.txt"));
              fs.unlinkSync(path.resolve(subbotDir, "pairing_code.txt"));
            }

            resolve();
          } else {
            infoLog("Cargando datos...");
          }
        });
      });

      socket.ev.on("creds.update", saveCreds);
    } catch (error) {
      errorLog(`Error al intentar emparejar ${phoneNumber}:`, error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    infoLog("Esperando nuevo número...");
  }
}

exports.connect = connect;
