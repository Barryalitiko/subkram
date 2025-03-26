const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["kramp"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    try {
      // URL de la imagen para la prueba
      let imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";

      // Descargar la imagen como buffer
      let response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      let imageBuffer = Buffer.from(response.data, "binary");

      // Crear el mensaje de texto que acompañará la cita
      let messageText = "Krampuskram";

      // Agregar el mensaje estilizado con cita
      let quotedMessage = webMessage;  // Usamos el mensaje original para citarlo

      let estilo = {
        key: {
          fromMe: false,
          participant: "1@s.whatsapp.net",  // Remitente original
        },
        message: {
          text: messageText,  // El mensaje de texto que se va a enviar
        },
      };

      // Enviar el mensaje de texto con la cita del mensaje original
      await socket.sendMessage(remoteJid, { text: messageText }, { quoted: quotedMessage });

      sendReply("✅ Mensaje de texto estilizado enviado correctamente.");
    } catch (error) {
      console.error("❌ Error enviando el mensaje estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje estilizado.");
    }
  },
};
