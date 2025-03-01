const { PREFIX, TEMP_DIR } = require("../../krampus");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "subbot",
  description: "Genera un QR para conectar un subbot.",
  commands: ["subbot"],
  usage: `${PREFIX}subbot`,
  handle: async ({ socket, remoteJid, sendReply, sendReact }) => {
    try {
      sendReply("⏳ Generando QR para conectar el subbot...");

      const authPath = path.join(TEMP_DIR, "subbot_auth");
      const { state, saveCreds } = await useMultiFileAuthState(authPath);

      const subbot = makeWASocket({
        auth: state,
        printQRInTerminal: false
      });

      subbot.ev.on("connection.update", async ({ qr, connection }) => {
        if (qr) {
          // Generar el QR como imagen
          const qrImagePath = path.join(TEMP_DIR, "subbot_qr.png");
          await qrcode.toFile(qrImagePath, qr);

          // Enviar el QR como imagen
          await sendReply("📲 Escanea este QR para conectar el subbot.");
          await sendReact("📸");
          await socket.sendMessage(remoteJid, {
            image: { url: qrImagePath },
            caption: "QR generado para conectar el subbot."
          });

          // Limpiar el archivo de imagen después de enviarlo
          fs.unlinkSync(qrImagePath);
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