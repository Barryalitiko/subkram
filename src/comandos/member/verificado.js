const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      console.log("Iniciando proceso de envío de mensaje estilizado...");

      // URL de la imagen para la prueba
      let imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
      console.log(`URL de la imagen: ${imageUrl}`);

      // Descargar la imagen como buffer
      let response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      console.log("Imagen descargada correctamente.");

      let imageBuffer = Buffer.from(response.data, "binary");
      console.log("Buffer de imagen creado correctamente.");

      // Crear el mensaje con el estilo personalizado
      let messageContent = {
        image: imageBuffer,  // Buffer de la imagen descargada
        caption: "KrampusOM",  // Mensaje que acompaña la imagen
        mimetype: "image/png",  // Tipo MIME de la imagen (en este caso PNG)
      };

      // Agregar el mensaje estilizado con orden
      let estilo = {
        key: {
          fromMe: false,
          participant: "34614100052@s.whatsapp.net",
        },
        message: {
          orderMessage: {
            itemCount: 808080,
            status: 1,
            surface: 1,
            message: messageContent.caption,  // El mensaje que contiene la imagen
            orderTitle: "Bang",  // Título del mensaje (opcional)
            thumbnail: imageBuffer,  // Usar la imagen como thumbnail
            thumbnailMimeType: "image/png",  // Especificar el tipo de la miniatura
            sellerJid: "0@s.whatsapp.net",  // Vendedor (por defecto puede ser "0@s.whatsapp.net")
          }
        }
      };

      console.log("Mensaje estilizado preparado correctamente.");

      // Enviar el mensaje estilizado
      await socket.sendMessage(remoteJid, messageContent, { quoted: estilo });
      console.log("Mensaje estilizado enviado correctamente.");

    } catch (error) {
      console.error("❌ Error enviando el mensaje estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje estilizado.");
    }
  },
};
