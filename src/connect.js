const path = require("path");
const fs = require("fs");
const { onlyNumbers } = require("./utils");
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, isJidBroadcast, isJidStatusBroadcast, isJidNewsletter, proto, makeInMemoryStore } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { load } = require("./loader");
const { warningLog, infoLog, errorLog, sayLog, successLog } = require("./utils/logger");

const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");
const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

let cachedPhoneNumber = "";
let pairingCodeGenerated = false;

async function getMessage(key) {
  if (!store) return proto.Message.fromObject({});
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  const numberPath = path.join(TEMP_DIR, "number.txt");
  const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

  // Crear carpeta 'temp' si no existe
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    infoLog("[KRAMPUS] Carpeta 'temp' creada.");
  }

  // Comprobar si el número ya está almacenado
  if (!cachedPhoneNumber) {
    successLog("[Operacion 👻 Marshall] Kram está procesando...");
    while (true) {
      try {
        // Si el archivo no existe, lo creamos vacío
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
    sayLog(`[KRAMPUS] Número recibido: ${cachedPhoneNumber}`);
    fs.writeFileSync(numberPath, "", "utf8"); // Limpiamos el archivo después de leer el número
  }

  // Si el código de emparejamiento ya ha sido generado, evitamos regenerarlo
  if (!pairingCodeGenerated) {
    const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, "..", "assets", "auth", "baileys"));
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

    // Generar código de vinculación solo si no se ha generado previamente
    if (!fs.existsSync(pairingCodePath)) {
      try {
        const cleanPhoneNumber = onlyNumbers(cachedPhoneNumber);
        await new Promise((r) => setTimeout(r, 5000)); 
        if (socket.ws.readyState === socket.ws.OPEN) { 
          const code = await socket.requestPairingCode(cleanPhoneNumber);
          fs.writeFileSync(pairingCodePath, code, "utf8");
          sayLog(`[KRAMPUS] Código de Emparejamiento generado: ${code}`);
          pairingCodeGenerated = true;  // Marcamos que el código ha sido generado
        } else {
          warningLog("Conexión no establecida. No se puede generar código de vinculación.");
        }
      } catch (error) {
        errorLog(`Error generando código de emparejamiento: ${error}`);
      }
    } else {
      infoLog("[KRAMPUS] Código de emparejamiento ya generado previamente.");
    }

    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (!socket.authState.creds.registered) {
          warningLog("Usuario aún no ha vinculado. Esperando emparejamiento...");
          setTimeout(() => {
            connect().then((newSocket) => {
              load(newSocket);
            });
          }, 5000);
          return;
        }
        switch (statusCode) {
          case DisconnectReason.loggedOut:
            errorLog("Kram desconectado!");
            break;
          case DisconnectReason.badSession:
            warningLog("Sesión no válida!");
            break;
          case DisconnectReason.connectionClosed:
            warningLog("Conexión cerrada!");
            break;
          case DisconnectReason.connectionLost:
            warningLog("Conexión perdida!");
            break;
          case DisconnectReason.connectionReplaced:
            warningLog("Conexión reemplazada!");
            break;
          case DisconnectReason.multideviceMismatch:
            warningLog("Dispositivo incompatible!");
            break;
          case DisconnectReason.forbidden:
            warningLog("Conexión prohibida!");
            break;
          case DisconnectReason.restartRequired:
            infoLog('Krampus reiniciado! Reinicia con "npm start".');
            break;
          case DisconnectReason.unavailableService:
            warningLog("Servicio no disponible!");
            break;
          default:
            warningLog("Desconexión inesperada. Reintentando...");
        }
        const newSocket = await connect();
        load(newSocket);
      } else if (connection === "open") {
        successLog("Operacion Marshall completa. Kram está en línea ✅");
        pairingCodeGenerated = false;
        if (fs.existsSync(pairingCodePath)) {
          fs.unlinkSync(pairingCodePath);
          infoLog("[KRAMPUS] pairing_code.txt eliminado tras vinculación.");
        }
      } else {
        infoLog("Cargando datos...");
      }
    });

    socket.ev.on("creds.update", saveCreds);
    return socket;
  }
}

exports.connect = connect;
