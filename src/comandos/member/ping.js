const { PREFIX } = require("../../krampus");

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      // Verificar si el mensaje tiene una cita (quote)
      const quotedMessage = message?.quoted?.message;
      
      // Si el mensaje tiene una cita, creamos un contextInfo que simule un mensaje reenviado
      const contextInfo = {
        participant: '0@s.whatsapp.net', // El ID de la cuenta oficial de WhatsApp
        quotedMessage: quotedMessage || message.message, // El mensaje citado o el mismo mensaje si no hay cita
        quotedParticipant: '0@s.whatsapp.net' // El participante que envió el mensaje, en este caso la cuenta oficial
      };

      // El mensaje que el bot responderá
      const replyText = "🏓 Pong! El bot está online.";

      // Enviar el mensaje como respuesta a un mensaje citado o como reenvío
      await socket.sendMessage(remoteJid, {
        text: replyText,
        contextInfo: contextInfo
      });

      sendReply("Ping enviado correctamente como un mensaje reenviado.");
    } catch (error) {
      console.error("❌ Error en el comando ping:", error);
      sendReply("⚠️ Ocurrió un error al intentar enviar el mensaje.");
    }
  },
};