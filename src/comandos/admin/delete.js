const { PREFIX } = require("../../krampus");

module.exports = {
  name: "delete",
  description: "Eliminar un mensaje respondido",
  commands: ["delete", "del", "dlt", "dt"],
  usage: `${PREFIX}delete`,

  handle: async ({ sendReply, sendReact, message, client }) => {
    await sendReact("🗑️");

    if (!message.quoted) {
      return await sendReply("✳️ Responde al mensaje que deseas eliminar.");
    }

    try {
      const key = message.quoted.key;
      await client.sendMessage(message.chat, { delete: key });
      await sendReply("✅ ¡Mensaje eliminado con éxito!");
    } catch (error) {
      console.error("Error al eliminar el mensaje:", error);
      await sendReply("❌ No se pudo eliminar el mensaje.");
    }
  },
};

