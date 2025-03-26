const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "contacto",
  description: "Envía un contacto con un formato especial 📇",
  commands: ["contacto"],
  usage: `${PREFIX}contacto`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      // URL de la imagen para la prueba
      let imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";

      // Descargar la imagen como buffer
      let response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      let imageBuffer = Buffer.from(response.data, "binary");

      // Texto para el pie de la imagen
      let imageCaption = "KrampusOM"; 

      // Contacto a enviar
      let contactInfo = {
        displayName: "Krampus Support",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Krampus Support\nTEL;waid=573182165511:+57 318 216 5511\nEND:VCARD`,
      };

      // Mensaje de contacto estilizado
      let estilo = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
        },
        message: {
          contactMessage: {
            displayName: contactInfo.displayName,
            vcard: contactInfo.vcard,
          }
        }
      };

      // Crear el mensaje con la imagen
      let messageContent = {
        image: imageBuffer,  
        caption: imageCaption,  
        mimetype: "image/png",
      };

      // Enviar el mensaje con la imagen y el contacto estilizado
      await socket.sendMessage(remoteJid, messageContent, { quoted: estilo });

      console.log("✅ Contacto estilizado enviado correctamente.");
    } catch (error) {
      console.error("❌ Error enviando el contacto estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el contacto estilizado.");
    }
  },
};
