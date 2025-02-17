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

      const groupMetadata = await socket.groupMetadata(remoteJid);
      if (!groupMetadata.participants.find((p) => p.id === socket.user.jid && p.admin)) {
        await sendReply("❌ Solo los administradores pueden eliminar mensajes.");
        return;
      }

      const messageId = message.quoted.messageID;
      await socket.deleteMessage(remoteJid, messageId);
      await sendReply("🚮 Mensaje eliminado con éxito.");
    } catch (error) {
      console.error("Error al intentar eliminar el mensaje:", error);
      await sendReply("❌ No se pudo eliminar el mensaje. Asegúrate de que el bot es administrador.");
    }
  },
};
