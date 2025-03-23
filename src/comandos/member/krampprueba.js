const path = require("path");
const fs = require("fs");
const { PREFIX } = require("../../krampus");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = {
  name: "serbot",
  description: "Convertir número en bot con QR",
  commands: ["serbot"],
  usage: `${PREFIX}serbot`,
  handle: async ({ sendReply, sendReact, sender }) => {
    const subbotName = `subkramp_${Date.now()}`;
    const subbotPath = path.join(__dirname, `../subkramp/${subbotName}`);

    // Crear carpeta para el subbot si no existe
    if (!fs.existsSync(subbotPath)) {
      fs.mkdirSync(subbotPath, { recursive: true });
    }

    // Configuración del subbot
    const authPath = path.join(subbotPath, "auth");
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const subbot = makeWASocket({
      version,
      logger: pino({ level: "error" }),
      printQRInTerminal: false,
      auth: state,
    });

    // Mostrar el QR directamente al usuario
    if (!subbot.authState.creds.registered) {
      const code = await subbot.requestPairingCode(sender);
      await sendReply(`*Escanea este código para vincular tu subbot:* \n\n *${code}*`);
    }

    // Guardar credenciales
    subbot.ev.on("creds.update", saveCreds);

    subbot.ev.on("connection.update", ({ connection }) => {
      if (connection === "open") {
        sendReply("✅ *Subbot conectado correctamente!* ");
      } else if (connection === "close") {
        sendReply("⚠️ *El subbot se ha desconectado.*");
      }
    });
  },
};
