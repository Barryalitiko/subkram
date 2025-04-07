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
  successLog,
} = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function getMessage(key) {
  if (!store) {
    return proto.Message.fromObject({});
  }

  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  let phoneNumber;

  // Bucle que se mantiene esperando hasta obtener un número válido
  while (true) {
    // Leer el número desde el archivo temporal
    const tempFilePath = path.resolve(__dirname, "comandos", "temp", "number.txt");
    phoneNumber = fs.readFileSync(tempFilePath, "utf8").trim();

    // Si el número no es válido, espera 5 segundos y vuelve a intentar
    if (!phoneNumber) {
      errorLog('Número de teléfono inválido! Esperando número...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Espera 5 segundos antes de volver a intentar
      continue; // Regresa al inicio del bucle para intentar leer el número nuevamente
    }

    const { state, saveCreds } = await useMultiFileAuthState(
      path.resolve(__dirname, "..", "assets", "auth", "baileys")
    );

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

    try {
      // Intentar emparejar el número
      const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
      sayLog(`Código de Emparejamiento: ${code}`);

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          switch (statusCode) {
            case DisconnectReason.loggedOut:
              errorLog("Kram desconectado!");
              break;
            case DisconnectReason.badSession:
              warningLog("Sesion no válida!");
              break;
            case DisconnectReason.connectionClosed:
              warningLog("Conexion cerrada!");
              break;
            case DisconnectReason.connectionLost:
              warningLog("Conexion perdida!");
              break;
            case DisconnectReason.connectionReplaced:
              warningLog("Conexion de reemplazo!");
              break;
            case DisconnectReason.multideviceMismatch:
              warningLog("Dispositivo incompatible!");
              break;
            case DisconnectReason.forbidden:
              warningLog("Conexion prohibida!");
              break;
            case DisconnectReason.restartRequired:
              infoLog('Krampus reiniciado! Reinicia con "npm start".');
              break;
            case DisconnectReason.unavailableService:
              warningLog("Servicio no disponible!");
              break;
            default:
              errorLog("Desconocido, intenta nuevamente.");
              break;
          }

          // Volver a intentar la conexión después de un error
          infoLog("Esperando nuevo número...");
          break; // Aquí terminamos este ciclo y luego lo reiniciamos con el siguiente intento
        } else if (connection === "open") {
          successLog("Operacion Marshall");
          break; // Si la conexión se abre correctamente, salimos del ciclo
        } else {
          infoLog("Cargando datos...");
        }
      });

      socket.ev.on("creds.update", saveCreds);

      // Aquí dejamos el socket activo mientras que no haya un error
      await new Promise(resolve => socket.ev.on('connection.update', resolve));

    } catch (error) {
      errorLog("Error al intentar emparejar: ", error);
      // Si algo falla, vuelve a intentar desde el inicio
    }
  }
}

exports.connect = connect;
