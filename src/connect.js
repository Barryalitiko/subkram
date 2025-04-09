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
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
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

  const tempDir = path.join(__dirname, "comandos", "temp");
  const numberPath = path.join(tempDir, "number.txt");
  const pairingCodePath = path.join(tempDir, "pairing_code.txt");

  // Crear carpeta si no existe
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    warningLog("[KRAMPUS] Carpeta 'temp' creada.");
  }

  // Crear archivo si no existe
  if (!fs.existsSync(numberPath)) {
    fs.writeFileSync(numberPath, "", "utf8");
    warningLog("[KRAMPUS | ADVERTENCIA] El archivo number.txt no existía. Ahora se ha creado.");
  }

  // Espera infinita hasta que haya un número válido
  let phoneNumber = "";
  while (true) {
    phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
    if (phoneNumber) break;
    infoLog("[KRAMPUS] Esperando número válido en number.txt...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\x1b[36m[connect]\x1b[0m Número de subbot: \x1b[1m\x1b[33m${phoneNumber}\x1b[0m`);

  // Si no está registrado, generamos código de emparejamiento
  if (!socket.authState.creds.registered) {
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
    fs.writeFileSync(pairingCodePath, code, "utf8");
    sayLog(`Código de Emparejamiento: ${code}`);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("Kram desconectado!");
      } else {
        switch (statusCode) {
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
        }

        const newSocket = await connect();
        load(newSocket);
      }
    } else if (connection === "open") {
      successLog("Operacion 👻 Marshall");
    } else {
      infoLog("Cargando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;
