const { PREFIX } = require("../../krampus");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      // URL de la imagen para la prueba
      let imageUrl = "https://upload.wikimedia.org/wikipedia/en/6/60/Goku_Dragon_Ball_Z.png";

      // Descargar la imagen y enviarla como thumbnail
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
            thumbnail: await socket.downloadMediaMessage({ url: imageUrl }), // Descargar imagen de la URL
            thumbnailMimeType: "image/png", // Tipo de imagen
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
