const { PREFIX } = require("../../krampus");

module.exports = {
  name: "respuestaBot",
  description: "Responde como si el mensaje fuera de la cuenta oficial de WhatsApp",
  commands: ["respuestaBot"],
  usage: `${PREFIX}respuestaBot`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      // Verificar si el mensaje tiene una cita (quote)
      if (!message.quoted || !message.quoted.message) {
        return sendReply("⚠️ No se ha citado ningún mensaje.");
      }

      // Extraer el mensaje citado
      const quotedMessage = message.quoted.message;

      // Crear un objeto contextInfo que haga parecer que es una respuesta a un mensaje de la cuenta oficial de WhatsApp
      const contextInfo = {
        participant: '0@s.whatsapp.net', // El ID de la cuenta oficial de WhatsApp
        quotedMessage: quotedMessage, // El mensaje citado
        quotedParticipant: '0@s.whatsapp.net' // El participante que envió el mensaje, en este caso la cuenta oficial
      };

      // El mensaje que el bot responderá
      const replyText = "Este es un mensaje de prueba, como si fuera una respuesta a la cuenta oficial de WhatsApp.";

      // Enviar el mensaje como respuesta
      await socket.sendMessage(remoteJid, { 
        text: replyText, 
        contextInfo: contextInfo 
      });

      // Responder al usuario para confirmar que el mensaje fue enviado correctamente
      sendReply("✅ El mensaje fue enviado como respuesta a la cuenta oficial de WhatsApp.");
      
    } catch (error) {
      console.error("❌ Error en el comando respuestaBot:", error);

      // Responder al usuario si ocurre un error
      sendReply("⚠️ Ocurrió un error al intentar enviar el mensaje. Inténtalo de nuevo.");
    }
  },
};