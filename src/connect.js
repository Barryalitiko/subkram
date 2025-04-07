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

// Esta función obtiene un mensaje del almacenamiento del socket
async function getMessage(key) {
  if (!store) {
    return proto.Message.fromObject({});
  }

  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

// Función principal de conexión
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
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  // Si las credenciales no están configuradas, generamos un código de emparejamiento
  if (!socket.authState.creds.registered) {
    warningLog("Credenciales no configuradas!");

    infoLog(`Generando el código de emparejamiento para el número: ${phoneNumber}`);

    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

    const botName = phoneNumber;  // Usamos el número de teléfono como nombre para identificar al subbot
    const filePath = path.resolve(__dirname, "..", "subbots", "pending_codes", `${botName}.txt`);

    fs.writeFile(filePath, `Código de emparejamiento: ${code}`, (err) => {
      if (err) {
        errorLog("Error al guardar el código en el archivo temporal.");
        return;
      }
      successLog(`Código de emparejamiento guardado en ${filePath}`);
      sayLog(`Código de emparejamiento generado para el número ${phoneNumber}: ${code}`);

      // Aquí puedes agregar el código para enviar el código al bot principal si es necesario
      // sendCodeToMain(code, phoneNumber);
    });
  }

  // Monitorear los eventos de conexión
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

        const newSocket = await connect(phoneNumber); // Pasamos el número al reconectar
        load(newSocket);
      }
    } else if (connection === "open") {
      successLog("Operación Marshall");
    } else {
      infoLog("Cargando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

// Aquí es donde debería entrar la interacción con el bot principal
// El bot principal le enviará los números de teléfono al subbot
// Vamos a simular que se recibe el número desde algún canal aquí:

async function listenForNumberFromMain() {
  // Este código debería ser llamado cuando el bot principal envíe el número.
  // Simulamos la recepción del número aquí.
  const number = "1234567890"; // Este número debería ser dinámico y recibido del bot principal

  console.log(`Recibiendo número: ${number}`);
  const socket = await connect(number); // Inicia la conexión para ese número

  // Aquí podrías enviar el código de vinculación al bot principal, si es necesario
}

// Escucha constantemente por nuevos números
listenForNumberFromMain();  // Llamamos a la función para iniciar el proceso
