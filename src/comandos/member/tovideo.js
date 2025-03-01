const { PREFIX, TEMP_DIR } = require("../../krampus");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const path = require("path");

module.exports = {
  name: "subbot",
  description: "Genera un QR para conectar un subbot.",
  commands: ["subbot"],
  usage: `${PREFIX}subbot`,
  handle: async ({ sendReply }) => {
    try {
      sendReply("⏳ Generando QR para conectar el subbot...");

      const authPath = path.join(TEMP_DIR, "subbot_auth");
      const { state, saveCreds } = await useMultiFileAuthState(authPath);

      const subbot = makeWASocket({
        auth: state,
        printQRInTerminal: false
      });

      subbot.ev.on("connection.update", ({ qr, connection }) => {
        if (qr) {
          qrcode.generate(qr, { small: true });
          sendReply("📲 Escanea este QR para conectar el subbot.");
        }

        if (connection === "open") {
          sendReply("✅ Subbot conectado exitosamente.");
        }

        if (connection === "close") {
          sendReply("❌ La conexión del subbot se cerró.");
        }
      });

      subbot.ev.on("creds.update", saveCreds);
    } catch (error) {
      console.error("Error al crear el subbot:", error);
      await sendReply("❌ Hubo un error al generar el subbot.");
    }
  }
};