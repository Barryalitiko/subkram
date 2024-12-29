const { PREFIX } = require("../../krampus");

module.exports = {
  name: "pinMessage",
  description: "Fija un mensaje en el grupo.",
  commands: ["pin", "fijar"],
  usage: `${PREFIX}pin <responder a un mensaje>`,
  handle: async ({ socket, remoteJid, replyJid, sendReply }) => {
    try {
      // Validar si se responde a un mensaje
      if (!replyJid) {
        await sendReply("Debes responder a un mensaje para fijarlo.");
        return;
      }

      // Intentar fijar el mensaje
      await socket.sendMessage(remoteJid, {
        pin: { remoteJid, id: replyJid, permanent: true },
      });

      await sendReply("✅ Mensaje fijado con éxito.");
    } catch (error) {
      console.error("Error al fijar el mensaje:", error.message);
      await sendReply("❌ No se pudo fijar el mensaje. Asegúrate de que tienes permisos para hacerlo.");
    }
  },
};