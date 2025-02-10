const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

// 📌 Ruta de la carpeta de sesiones
const SESSION_PATH = path.join(__dirname, "../../../sessions");

module.exports = {
  name: "creabot",
  description: "Inicia el proceso para convertir tu número en un bot de WhatsApp usando QR",
  commands: ["creabot"],
  usage: `${PREFIX}creabot`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      // Enviar un mensaje indicando que solo se usará QR
      const replyText = `📌 Para convertir tu número en un bot de WhatsApp, usa el siguiente comando para generar el QR: \n\n\`#creabot1\``;
      await sendReply(replyText);

    } catch (error) {
      console.error("❌ Error en el comando creabot:", error);
      sendReply("⚠️ Ocurrió un error al intentar generar el bot.");
    }
  },
};