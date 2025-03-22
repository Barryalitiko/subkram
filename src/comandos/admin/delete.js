const { PREFIX } = require("../../krampus");

module.exports = {
  name: "delete",
  description: "Eliminar un mensaje respondido",
  commands: ["delete", "del", "dlt", "dt"],
  usage: `${PREFIX}delete`,

  handle: async ({ sendReply, sendReact, webMessage, socket, remoteJid }) => {
    await sendReact("🗑️");

    if (!webMessage.message.extendedTextMessage || !webMessage.message.extendedTextMessage.contextInfo) {
      return await sendReply("✳️ *Responde al mensaje que deseas eliminar.*");
    }

    try {
      const key = webMessage.message.extendedTextMessage.contextInfo.stanzaId;
      const participant = webMessage.message.extendedTextMessage.contextInfo.participant;

      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid: remoteJid,
          fromMe: participant === socket.user.id,
          id: key,
          participant: participant,
        },
      });

      await sendReply("✅ *Mensaje eliminado con éxito!*");
    } catch (error) {
      console.error("Error al eliminar el mensaje:", error);
      await sendReply("❌ *No se pudo eliminar el mensaje.*");
    }
  },
};
