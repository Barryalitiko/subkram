const fs = require("fs");
const path = require("path");
const { onlyNumbers } = require("./utils");
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

const TEMP_DIR = path.resolve(__dirname, "..", "temp");
const numberFile = path.join(TEMP_DIR, "number.txt");
const pairingCodeFile = path.join(TEMP_DIR, "pairing_code.txt");

async function getMessage(key) {
  return proto.Message.fromObject({});
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

    if (!fs.existsSync(numberFile)) {
      errorLog(`Archivo de número no encontrado: ${numberFile}`);
      process.exit(1);
    }

    const phoneNumberRaw = fs.readFileSync(numberFile, "utf-8").trim();

    if (!phoneNumberRaw) {
      errorLog("El archivo number.txt está vacío.");
      process.exit(1);
    }

    const phoneNumber = onlyNumbers(phoneNumberRaw);
    infoLog(`Número a vincular: ${phoneNumber}`);

    try {
      const code = await socket.requestPairingCode(phoneNumber);

      sayLog(`Código de emparejamiento generado: ${code}`);

      fs.writeFileSync(pairingCodeFile, code);
      successLog(`Código de emparejamiento guardado en: ${pairingCodeFile}`);
    } catch (err) {
      errorLog(`Error generando código de emparejamiento: ${err.message}`);
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
