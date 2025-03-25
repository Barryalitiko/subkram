const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      // Ruta de la imagen
      let imagePath = path.join(__dirname, "../../../assets/images/goku.jpg");

      // Verificar que el archivo existe
      if (!fs.existsSync(imagePath)) {
        return sendReply("⚠️ La imagen no fue encontrada en la ruta especificada.");
      }

      // Leer la imagen y convertirla en buffer
      let imageBuffer = fs.readFileSync(imagePath);

      // Enviar el mensaje estilizado con la imagen como `thumbnail`
      let estilo = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
        },
        message: {
          orderMessage: {
            itemCount: -999999,
            status: 1,
            surface: 1,
            message: "👑【✫ᴍᴏɴᴛᴀɴᴀ✫】🪩",
            orderTitle: "Bang",
            thumbnail: imageBuffer, // Imagen en buffer
            thumbnailMimeType: "image/jpeg", // Asegurar que el tipo sea correcto
            sellerJid: "0@s.whatsapp.net",
          }
        }
      };

      // Enviar mensaje
      await socket.sendMessage(remoteJid, estilo);
    } catch (error) {
      console.error("❌ Error enviando el mensaje estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje estilizado.");
    }
  },
};
