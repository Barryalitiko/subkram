const fs = require("fs");
const path = require("path");
const { question, onlyNumbers } = require("./utils");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
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
  successLog,
} = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

const TEMP_DIR = path.resolve(__dirname, "..", "assets", "temp");
const numberFile = path.join(TEMP_DIR, "number.txt");
const pairingCodeFile = path.join(TEMP_DIR, "pairing_code.txt");

async function getMessage(key) {
  return proto.Message.fromObject({});
}

// Esperar pacientemente a que aparezca un número válido
async function esperarNumero() {
  infoLog(`Esperando número en: ${numberFile}...`);

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (fs.existsSync(numberFile)) {
        const phoneNumberRaw = fs.readFileSync(numberFile, "utf-8").trim();
        if (phoneNumberRaw) {
          clearInterval(interval);
          resolve(onlyNumbers(phoneNumberRaw));
        }
      }
    }, 1000); // verificar cada segundo
  });
}

async function connect() {
  reconnectAttempts = 0;

  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "error" }),
    printQRInTerminal: true,
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

  if (!socket.authState.creds.registered) {
    warningLog("¡Credenciales no configuradas!");

    const phoneNumber = await esperarNumero();
    infoLog(`Número a vincular: ${phoneNumber}`);

    try {
      const code = await socket.requestPairingCode(phoneNumber);
      sayLog(`Código de emparejamiento: ${code}`);

      fs.writeFileSync(pairingCodeFile, code, "utf-8");
      successLog(`Código guardado en: ${pairingCodeFile}`);

      // Limpiar el archivo number.txt
      fs.unlinkSync(numberFile);
      infoLog("Archivo number.txt eliminado.");
    } catch (err) {
      errorLog(`Error generando código: ${err.message}`);
      process.exit(1);
    }
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("¡Sesión cerrada! Reinicia manualmente.");
        process.exit(1);
      } else {
        switch (statusCode) {
          case DisconnectReason.badSession:
            warningLog("¡Sesión no válida! Elimina la carpeta de autenticación.");
            break;
          case DisconnectReason.connectionClosed:
            warningLog("¡Conexión cerrada inesperadamente!");
            break;
          case DisconnectReason.connectionLost:
            warningLog("¡Conexión perdida! Intentando reconectar...");
            break;
          case DisconnectReason.connectionReplaced:
            warningLog("¡Sesión iniciada en otro dispositivo! Cerrando.");
            process.exit(1);
            break;
          case DisconnectReason.multideviceMismatch:
            warningLog("¡Dispositivo incompatible! Elimina la sesión y vuelve a intentarlo.");
            process.exit(1);
            break;
          case DisconnectReason.forbidden:
            warningLog("¡Acceso prohibido! Verifica tu número.");
            process.exit(1);
            break;
          case DisconnectReason.restartRequired:
            infoLog('Reiniciando... Usa "npm start" para volver a iniciar.');
            break;
          case DisconnectReason.unavailableService:
            warningLog("¡Servicio de WhatsApp no disponible temporalmente!");
            break;
          default:
            warningLog("Desconexión inesperada.");
            break;
        }

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = reconnectAttempts * 5000;

          warningLog(`Intento de reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} en ${delay / 1000} segundos...`);

          setTimeout(async () => {
            const newSocket = await connect();
            load(newSocket);
          }, delay);
        } else {
          errorLog("¡Máximo de intentos de reconexión alcanzado! Reinicia manualmente.");
          process.exit(1);
        }
      }
    } else if (connection === "open") {
      successLog("¡Bot conectado exitosamente!");
    } else {
      infoLog("Cargando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;
