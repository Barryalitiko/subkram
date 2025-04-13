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
const { warningLog, infoLog, errorLog, sayLog, successLog } = require("./utils/logger");

class Bot {
  constructor(phoneNumber) {
    this.phoneNumber = phoneNumber;
    this.logger = pino({ level: "info", name: phoneNumber });
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    const TEMP_DIR = path.resolve(`./temp/${this.phoneNumber}`);
    const numberPath = path.join(TEMP_DIR, "number.txt");
    const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
      this.logger.info("[KRAMPUS] Carpeta 'temp' creada.");
    }

    if (!fs.existsSync(numberPath)) {
      fs.writeFileSync(numberPath, "", "utf8");
    }

    const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();

    if (!phoneNumber) {
      this.logger.info("[KRAMPUS] Esperando número válido en number.txt...");
      return;
    }

    this.logger.info(`[KRAMPUS] Número recibido: ${phoneNumber}`);
    fs.writeFileSync(numberPath, "", "utf8");

    const { state, saveCreds } = await useMultiFileAuthState(
      path.resolve(__dirname, "..", "assets", "auth", "baileys", this.phoneNumber)
    );

    const { version } = await fetchLatestBaileysVersion();

    const msgRetryCounterCache = new NodeCache();
    const store = makeInMemoryStore({
      logger: pino().child({ level: "silent", stream: "store" }),
    });

    const socket = makeWASocket({
      version,
      logger: this.logger.child({ level: "error" }),
      printQRInTerminal: false,
      defaultQueryTimeoutMs: 60 * 1000,
      auth: state,
      shouldIgnoreJid: (jid) =>
        isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
      keepAliveIntervalMs: 60 * 1000,
      markOnlineOnConnect: true,
      msgRetryCounterCache,
      shouldSyncHistoryMessage: () => false,
      getMessage: async (key) => {
        if (!store) return proto.Message.fromObject({});
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg ? msg.message : undefined;
      },
    });

    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;

        // Manejo de errores
        switch (statusCode) {
          case DisconnectReason.loggedOut:
            this.logger.error("Kram desconectado!");
            break;
          case DisconnectReason.badSession:
            this.logger.warn("Sesión no válida!");
            break;
          case DisconnectReason.connectionClosed:
            this.logger.warn("Conexión cerrada!");
            break;
          case DisconnectReason.connectionLost:
            this.logger.warn("Conexión perdida!");
            break;
          case DisconnectReason.connectionReplaced:
            this.logger.warn("Conexión reemplazada!");
            break;
          case DisconnectReason.multideviceMismatch:
            this.logger.warn("Dispositivo incompatible!");
            break;
          case DisconnectReason.forbidden:
            this.logger.warn("Conexión prohibida!");
            break;
          case DisconnectReason.restartRequired:
            this.logger.info('Krampus reiniciado! Reinicia con "npm start".');
            break;
          case DisconnectReason.unavailableService:
            this.logger.warn("Servicio no disponible!");
            break;
          default:
            this.logger.warn("Desconexión inesperada. Reintentando...");
        }

        // Reconexión
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const newSocket = await this.connect();
          load(newSocket);
        } else {
          this.logger.error(`No se pudo reconectar después de ${this.maxReconnectAttempts} intentos.`);
        }
      } else if (connection === "open") {
        this.logger.info("Operacion Marshall completa. Kram está en línea ✅");

        if (fs.existsSync(pairingCodePath)) {
          fs.unlinkSync(pairingCodePath);
          this.logger.info("[KRAMPUS] pairing_code.txt eliminado tras vinculación.");
        }
      } else {
        this.logger.info("Cargando datos...");
      }
    });

    socket.ev.on("creds.update", saveCreds);

    return socket;
  }
}

async function connect() {
  const bots = [
    new Bot("111111111"),
    new Bot("222222222"),
    // Agrega más bots aquí
  ];

  const sockets = [];
  for (const bot of bots) {
    const socket = await bot.connect();
    sockets.push(socket);
  }

  return sockets;
}

exports.connect = connect;