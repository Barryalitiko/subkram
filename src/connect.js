const path = require("path");
const fs = require("fs");
const { onlyNumbers } = require("./utils");
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, isJidBroadcast, isJidStatusBroadcast, proto, makeInMemoryStore, isJidNewsletter, } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { load } = require("./loader");
const { warningLog, infoLog, errorLog, sayLog, successLog, } = require("./utils/logger");
const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }), });
let cachedPhoneNumber = "";
let pairingCodeGenerated = false;
const activeBots = {}; // Para almacenar las instancias activas por número
const TIMEOUT = 300000; // 5 minutos para esperar la vinculación
const generatedCodes = new Set(); // Para almacenar los códigos generados y evitar duplicados

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function createBotInstance(phoneNumber) {
  // Si ya existe una instancia para este número, no creamos otra.
  if (activeBots[phoneNumber]) {
    infoLog(`[KRAMPUS] Ya existe una instancia para ${phoneNumber}.`);
    return activeBots[phoneNumber];
  }

  infoLog(`[KRAMPUS] Creando nueva instancia para ${phoneNumber}...`);
  const socket = await connect(phoneNumber); // Aquí usamos la función de conexión que creamos

  activeBots[phoneNumber] = socket; // Guardamos la nueva instancia
  return socket;
}

async function connect(phoneNumber) {
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

  // Leemos el número, creamos la instancia y generamos el código de vinculación
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog("[KRAMPUS] Carpeta 'temp' creada.");
  }

  if (!phoneNumber) {
    infoLog("[KRAMPUS] Esperando número...");
    return; // Si no hay número, simplemente salimos
  }

  // Comprobamos si ya se generó un código para este número
  if (generatedCodes.has(phoneNumber)) {
    infoLog(`[KRAMPUS] Ya se ha generado un código para ${phoneNumber}. No se generará uno nuevo.`);
    return; // Si ya se generó, salimos sin generar un nuevo código
  }

  // Aquí ya generamos el código de vinculación y guardamos el código
  const cleanPhoneNumber = onlyNumbers(phoneNumber);
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
    shouldIgnoreJid: (jid) => isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  try {
    const code = await socket.requestPairingCode(cleanPhoneNumber);
    fs.writeFileSync(pairingCodePath, code, "utf8");
    sayLog(`[KRAMPUS] Código de Emparejamiento generado para ${phoneNumber}: ${code}`);
    generatedCodes.add(phoneNumber); // Marcamos que ya se generó el código para este número
  } catch (error) {
    errorLog(`Error generando código de emparejamiento para ${phoneNumber}: ${error}`);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (!socket.authState.creds.registered) {
        warningLog(`[KRAMPUS] Usuario ${phoneNumber} aún no ha vinculado. Esperando emparejamiento...`);
        setTimeout(() => {
          connect(phoneNumber); // Reintenta la conexión para ese número
        }, 5000);
        return;
      }
      switch (statusCode) {
        case DisconnectReason.loggedOut:
          errorLog(`Kram para ${phoneNumber} desconectado!`);
          break;
        case DisconnectReason.connectionClosed:
          warningLog(`Conexión cerrada para ${phoneNumber}!`);
          break;
        case DisconnectReason.connectionLost:
          warningLog(`Conexión perdida para ${phoneNumber}!`);
          break;
        case DisconnectReason.connectionReplaced:
          warningLog(`Conexión reemplazada para ${phoneNumber}!`);
          break;
        case DisconnectReason.multideviceMismatch:
          warningLog(`Dispositivo incompatible para ${phoneNumber}!`);
          break;
        case DisconnectReason.forbidden:
          warningLog(`Conexión prohibida para ${phoneNumber}!`);
          break;
        case DisconnectReason.restartRequired:
          infoLog('Krampus reiniciado! Reinicia con "npm start".');
          break;
        case DisconnectReason.unavailableService:
          warningLog(`Servicio no disponible para ${phoneNumber}!`);
          break;
        default:
          warningLog("Desconexión inesperada. Reintentando...");
      }
    } else if (connection === "open") {
      successLog(`[KRAMPUS] ${phoneNumber} vinculado correctamente.`);
      pairingCodeGenerated = false;
      if (fs.existsSync(pairingCodePath)) {
        fs.unlinkSync(pairingCodePath);
        infoLog("[KRAMPUS] pairing_code.txt eliminado tras vinculación.");
      }
    }
  });

  socket.ev.on("creds.update", saveCreds);
  
  handleTimeout(phoneNumber); // Comienza a contar el tiempo para eliminar la instancia si no se vincula

  return socket; // Retornamos la instancia creada
}

function handleTimeout(phoneNumber) {
  // Borramos la instancia después de cierto tiempo si no se ha vinculado
  setTimeout(() => {
    if (activeBots[phoneNumber]) {
      warningLog(`[KRAMPUS] El bot para ${phoneNumber} no se vinculó a tiempo. Eliminando instancia...`);
      delete activeBots[phoneNumber]; // Eliminamos la instancia
      generatedCodes.delete(phoneNumber); // Eliminamos el código generado para este número
    }
  }, TIMEOUT);
}

async function main() {
  const numberPath = path.join(TEMP_DIR, "number.txt");

  // Esperamos a que llegue un número
  while (true) {
    try {
      if (!fs.existsSync(numberPath)) fs.writeFileSync(numberPath, "", "utf8");
      const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();
      if (phoneNumber) {
        cachedPhoneNumber = phoneNumber;
        break;
      }
      infoLog("[KRAMPUS] Esperando número válido en number.txt...");
    } catch (err) {
      warningLog(`[KRAMPUS] Error leyendo number.txt: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  // Procesamos el número recibido y creamos la instancia del bot
  sayLog(`[KRAMPUS] Número recibido: ${cachedPhoneNumber}`);
  fs.writeFileSync(numberPath, "", "utf8"); // Limpiamos el archivo

  await createBotInstance(cachedPhoneNumber); // Creamos la instancia del bot para el número
}

main();

exports.connect = connect;
