const { PREFIX } = require("../../krampus");

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      // Verificar si el mensaje tiene una cita (quote) y que la estructura es válida
      const quotedMessage = message?.quoted?.message;

      // Si no hay un mensaje citado, utilizamos un mensaje por defecto
      const contextInfo = quotedMessage
        ? {
            participant: '0@s.whatsapp.net', // ID de la cuenta oficial de WhatsApp
            quotedMessage: quotedMessage,
            quotedParticipant: '0@s.whatsapp.net', // El participante que envió el mensaje
          }
        : null; // Si no hay mensaje citado, no se añade contextInfo

      // El mensaje que el bot responderá
      const replyText = "🏓 Pong! El bot está online.";

      // Enviar el mensaje como respuesta, usando contextInfo solo si está presente
      if (contextInfo) {
        await socket.sendMessage(remoteJid, {
          text: replyText,
          contextInfo: contextInfo,
        });
      } else {
        await socket.sendMessage(remoteJid, {
          text: replyText,
        });
      }

      sendReply("Ping enviado correctamente como un mensaje reenviado.");
    } catch (error) {
      console.error("❌ Error en el comando ping:", error);
      sendReply("⚠️ Ocurrió un error al intentar enviar el mensaje.");
    }
  },
};