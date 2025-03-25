const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    try {
      // Cargar la imagen desde la ruta especificada
      let imagePath = path.join(__dirname, "../../../assets/images/goku.jpg");
      let catalogo = fs.readFileSync(imagePath); // Leer la imagen como buffer

      // Definir el mensaje con el formato `orderMessage`
      let estilo = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          ...(false ? { remoteJid: "" } : {})
        },
        message: {
          orderMessage: {
            itemCount: -999999,
            status: 1,
            surface: 1,
            message: "👑【✫ᴍᴏɴᴛᴀɴᴀ✫】🪩",
            orderTitle: "Bang",
            thumbnail: catalogo, // Se usa la imagen cargada
            thumbnailMimeType: "image/jpeg", // **IMPORTANTE: Especificar el tipo MIME**
            sellerJid: "0@s.whatsapp.net"
          }
        }
      };

      // Enviar el mensaje con el formato especial
      await socket.sendMessage(remoteJid, estilo);
    } catch (error) {
      console.error("❌ Error enviando el mensaje estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje estilizado.");
    }
  },
};
