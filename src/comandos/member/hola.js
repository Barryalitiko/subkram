const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

module.exports = {
  name: "respuestaBot",
  description: "Responde como si el mensaje fuera de la cuenta oficial de WhatsApp",
  commands: ["respuestaBot"],
  usage: `${PREFIX}respuestaBot`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      // Verificar si el mensaje tiene un mensaje citado
      const quotedMessage = message.quoted ? message.quoted : null;

      // Si no hay mensaje citado, informamos al usuario
      if (!quotedMessage) {
        return sendReply("⚠️ No se ha citado ningún mensaje.");
      }

      // Crear un objeto contextInfo que haga parecer que es una respuesta a un mensaje de la cuenta oficial de WhatsApp
      const contextInfo = {
        participant: '0@s.whatsapp.net', // El ID de la cuenta oficial de WhatsApp
        quotedMessage: quotedMessage, // Aquí colocamos el mensaje al que se respondería
        quotedParticipant: '0@s.whatsapp.net' // El participante que envió el mensaje, en este caso la cuenta oficial
      };

      // El mensaje que el bot responderá
      const replyText = "Este es un mensaje de prueba, como si fuera una respuesta a la cuenta oficial de WhatsApp.";

      // Enviar el mensaje como respuesta
      await socket.sendMessage(remoteJid, { 
        text: replyText, 
        contextInfo: contextInfo 
      });

      sendReply("Mensaje enviado como respuesta a la cuenta oficial de WhatsApp.");
      
    } catch (error) {
      console.error("❌ Error en el comando respuestaBot:", error);
      sendReply("⚠️ Ocurrió un error al intentar enviar el mensaje.");
    }
  },
};