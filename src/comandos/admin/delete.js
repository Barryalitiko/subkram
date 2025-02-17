const { PREFIX } = require("../../krampus");

module.exports = {
  name: "delete",
  description: "Eliminar un mensaje en el grupo.",
  commands: ["delete"],
  usage: `${PREFIX}delete <id del mensaje>`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      if (!remoteJid.endsWith("@g.us")) {
        await sendReply("❌ Este comando solo puede usarse en grupos.");
        return;
      }

      const messageId = message.quoted.messageID;
      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid,
          fromMe: false,
          id: messageId,
          participant: message.participant,
        },
      });
      await sendReply("🚮 Mensaje eliminado con éxito.");
    } catch (error) {
      console.error("Error al intentar eliminar el mensaje:", error);
      await sendReply("❌ No se pudo eliminar el mensaje.");
    }
  },
};
