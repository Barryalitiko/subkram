const { PREFIX } = require("../../krampus");

module.exports = {
  name: "delete",
  description: "Elimina un mensaje para todos.",
  commands: ["del"],
  usage: `${PREFIX}del (responde a un mensaje)`,
  handle: async ({ socket, remoteJid, sendReply, webMessage }) => {
    try {
      // Verificar si el usuario respondió a un mensaje
      if (!webMessage.message.extendedTextMessage) {
        return sendReply("Debes responder a un mensaje para eliminarlo.");
      }

      // Obtener el mensaje a eliminar
      const msgKey = webMessage.message.extendedTextMessage.contextInfo.stanzaId;
      const senderJid = webMessage.message.extendedTextMessage.contextInfo.participant;

      if (!msgKey || !senderJid) {
        return sendReply("No se pudo identificar el mensaje a eliminar.");
      }

      // Eliminar el mensaje
      await socket.sendMessage(remoteJid, { delete: { id: msgKey, remoteJid, fromMe: false } });

    } catch (error) {
      console.error("Error al eliminar el mensaje:", error.message);
      await sendReply("Ocurrió un error al intentar eliminar el mensaje.");
    }
  },
};