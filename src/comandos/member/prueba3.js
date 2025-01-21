const { PREFIX } = require("../../krampus");

module.exports = {
  name: "replyinfo",
  description: "Responde con el número de teléfono y el contenido del mensaje al que se respondió.",
  commands: ["replyinfo", "info"],
  usage: `${PREFIX}replyinfo <respuesta>`,
  handle: async ({ socket, remoteJid, sendReply, args, message }) => {
    try {
      // Verificar si el mensaje es una respuesta
      if (!message || !message.message || !message.message.extendedTextMessage) {
        return await sendReply("❌ Este comando solo funciona cuando respondes a un mensaje.");
      }

      // Obtener el mensaje al que se respondió
      const quotedMessage = message.message.extendedTextMessage.contextInfo;

      // Verificar si el mensaje citado tiene un número de teléfono
      if (!quotedMessage || !quotedMessage.participant) {
        return await sendReply("❌ No se pudo obtener el número de teléfono del mensaje citado.");
      }

      const phoneNumber = quotedMessage.participant;  // El número de teléfono de quien envió el mensaje original
      const originalMessage = quotedMessage.quotedMessage.extendedTextMessage.text || "Mensaje no disponible."; // El contenido del mensaje original

      // Responder con el número de teléfono y el contenido del mensaje
      await sendReply(`📞 Número del remitente: ${phoneNumber}\n💬 Mensaje original: ${originalMessage}`);
    } catch (error) {
      console.error("Error al procesar el comando replyinfo:", error);
      await sendReply("❌ Hubo un error al procesar tu solicitud.");
    }
  },
};