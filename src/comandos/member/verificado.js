const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      // URL de la imagen para la prueba
      let imageUrl = "https://upload.wikimedia.org/wikipedia/en/6/60/Goku_Dragon_Ball_Z.png";

      // Descargar la imagen como buffer
      let response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      let imageBuffer = Buffer.from(response.data, "binary");

      // Crear el mensaje con el estilo personalizado
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
            thumbnail: imageBuffer, // Usar la imagen descargada
            thumbnailMimeType: "image/png", // Especificar el tipo de imagen
            sellerJid: "0@s.whatsapp.net",
          }
        }
      };

      // Enviar el mensaje estilizado
      await socket.sendMessage(remoteJid, estilo);
    } catch (error) {
      console.error("❌ Error enviando el mensaje estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje estilizado.");
    }
  },
};
