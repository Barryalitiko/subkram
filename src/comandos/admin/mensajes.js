const { PREFIX } = require("../../krampus");
const { addMessage, getDeletedMessages } = require("../../services/mensajeCache");

module.exports = {
  name: "mensajes",
  description: "Ver los últimos 6 mensajes borrados del grupo",
  commands: ["mensajes-borrados", "ver-mensajes"],
  usage: `${PREFIX}mensajes-borrados`,
  cooldown: 10, // 10 segundos de cooldown
  handle: async ({ sendReply, remoteJid }) => {
    try {
      const deletedMessages = getDeletedMessages(remoteJid);

      if (!deletedMessages.length) {
        await sendReply("No hay mensajes borrados recientes.");
        return;
      }

      let response = "📝 *Últimos mensajes borrados:* 📝\n\n";
      deletedMessages.forEach((msg, index) => {
        response += `${index + 1}. ${msg}\n`;
      });

      await sendReply(response);
    } catch (error) {
      console.error("[MENSAJES] Error al obtener los mensajes:", error);
      await sendReply("❌ Hubo un error al intentar obtener los mensajes borrados.");
    }
  },
};