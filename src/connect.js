const path = require("path");
const fs = require('fs');
const { question, onlyNumbers } = require("./utils");
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

  // Si las credenciales no están configuradas, generamos un código de vinculación
  if (!socket.authState.creds.registered) {
    warningLog("Credenciales no configuradas!");

    infoLog('Ingrese su numero sin el + (ejemplo: "13733665556"):');

    const phoneNumber = await question("Ingresa el numero: ");

    if (!phoneNumber) {
      errorLog(
        'Numero de telefono inválido! Reinicia con el comando "npm start".'
      );

      process.exit(1);
    }

    // Generar el código de emparejamiento
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

    // Guardar el código de emparejamiento en un archivo específico
    const botName = phoneNumber;  // Usamos el número de teléfono como nombre para identificar al subbot
    const filePath = path.resolve(__dirname, "..", "subbots", "pending_codes", `${botName}.txt`);

    // Guardamos el código en un archivo
    fs.writeFile(filePath, `Código de emparejamiento: ${code}`, (err) => {
      if (err) {
        errorLog("Error al guardar el código en el archivo temporal.");
        return;
      }
      successLog(`Código de emparejamiento guardado en ${filePath}`);
      sayLog(`Código de emparejamiento generado para el número ${phoneNumber}: ${code}`);

      // Aquí enviarías el código al principal (puedes agregar el código para ello aquí)
      // Como ejemplo, supongamos que `sendCodeToMain` es la función que enviará el código al principal.
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

        const newSocket = await connect();
        load(newSocket);
      }
    } else if (connection === "open") {
      successLog("Operacion Marshall");
    } else {
      infoLog("Cargando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;

