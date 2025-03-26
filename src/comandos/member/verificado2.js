const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "respuesta",
  description: "Envía un mensaje de texto respondiendo a un mensaje previo",
  commands: ["respuesta"],
  usage: `${PREFIX}respuesta`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    try {
      // Obtener el mensaje que se quiere responder (asumiendo que es un mensaje de texto previo)
      const quotedMessage = webMessage;

      // Crear el contenido del mensaje de respuesta
      let messageContent = {
        text: "¡Este es un mensaje de respuesta al mensaje previo!",  // El texto que se va a enviar
      };

      // Cambiar el remitente de la previsualización (puede ser cualquier otro JID)
      let respuesta = {
        key: {
          fromMe: false,  // Esto indica que no es el bot quien lo envía
          participant: "otro_jid@whatsapp.net",  // Cambiar el JID aquí para simular otro remitente
        },
        message: {
          textMessage: messageContent.text,  // El mensaje que contiene el texto
        }
      };

      // Enviar el mensaje como una respuesta a un mensaje de texto anterior
      await socket.sendMessage(remoteJid, messageContent, { quoted: quotedMessage });

      sendReply("✅ Mensaje enviado como respuesta al mensaje previo.");
    } catch (error) {
      console.error("❌ Error enviando el mensaje:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje.");
    }
  },
};
