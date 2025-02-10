const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

// 📌 Ruta de la carpeta de sesiones
const SESSION_PATH = path.join(__dirname, "../../../sessions");

module.exports = {
  name: "creabot",
  description: "Inicia el proceso para convertir tu número en un bot de WhatsApp",
  commands: ["creabot"],
  usage: `${PREFIX}creabot`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      // Enviar un mensaje pidiendo al usuario que elija entre QR o código
      const replyText = `📌 Para convertir tu número en un bot de WhatsApp, elige una de las siguientes opciones:
1️⃣ Usar **QR** con \`#creabot1\`
2️⃣ Usar **Código** con \`#creabot2\``;
      await sendReply(replyText);

    } catch (error) {
      console.error("❌ Error en el comando creabot:", error);
      sendReply("⚠️ Ocurrió un error al intentar generar el bot.");
    }
  },
};