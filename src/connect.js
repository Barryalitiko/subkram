const path = require("path");
const fs = require('fs');
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
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { warningLog, infoLog, errorLog, successLog } = require("./utils/logger");

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

async function connect(phoneNumber) {
  if (!phoneNumber) {
    errorLog('Número de teléfono no proporcionado');
    process.exit(1);
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
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  if (!socket.authState.creds.registered) {
    warningLog("Credenciales no configuradas!");

    infoLog(`Generando el código de emparejamiento para el número: ${phoneNumber}`);

    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

    const botName = phoneNumber;
    const filePath = path.resolve(__dirname, "..", "subbots", "pending_codes", `${botName}.txt`);

    fs.writeFile(filePath, `Código de emparejamiento: ${code}`, (err) => {
      if (err) {
        errorLog("Error al guardar el código en el archivo temporal.");
        return;
      }
      successLog(`Código de emparejamiento guardado en ${filePath}`);
      // Aquí puedes agregar el código para enviar el código al bot principal si es necesario
      // sendCodeToMain(code, phoneNumber);
    });
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("Kram desconectado!");
      } else {
        infoLog("Reiniciando conexión...");
        const newSocket = await connect(phoneNumber); // Reconectando con el número
      }
    } else if (connection === "open") {
      successLog("Conexión abierta.");
    } else {
      infoLog("Cargando...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

async function listenForNumberFromMain() {
  // Este código se ejecutará cuando el bot principal envíe el número
  const number = await receiveNumberFromMain();  // Simulación de recibir número dinámicamente

  if (!number) {
    errorLog('Número de teléfono no recibido correctamente.');
    return;
  }

  console.log(`Recibiendo número: ${number}`);
  await connect(number); // Conecta con el número proporcionado por el bot principal
}

async function receiveNumberFromMain() {
  // Simulamos que recibimos el número aquí:
  return "1234567890";  // Este es solo un número de ejemplo, en la implementación real se debe recibir dinámicamente.
}

// Llamar a esta función para escuchar por nuevos números
listenForNumberFromMain(); 
