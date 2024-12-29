const { PREFIX } = require("../../krampus");

module.exports = {
  name: "eliminar",
  description: "Elimina los últimos 10 mensajes enviados por ti en el grupo.",
  commands: ["eliminar", "delete"],
  usage: `${PREFIX}eliminar`,
  handle: async ({ socket, remoteJid, sender, sendReply, sendReact }) => {
    try {
      // Obtenemos los últimos mensajes del chat
      const chatHistory = await socket.fetchMessages(remoteJid, { limit: 50 });

      // Filtramos los últimos 10 mensajes enviados por el usuario
      const userMessages = chatHistory
        .filter(
          (msg) =>
            msg.key.participant === sender && // Mensajes del usuario que ejecutó el comando
            msg.key.fromMe // Solo los mensajes que el bot puede eliminar
        )
        .slice(0, 10);

      if (userMessages.length === 0) {
        await sendReply("❌ No hay mensajes recientes tuyos que se puedan eliminar.");
        return;
      }

      // Eliminamos los mensajes uno por uno
      for (const message of userMessages) {
        await socket.deleteMessage(remoteJid, { id: message.key.id, fromMe: true });
      }

      await sendReact("✅");
      await sendReply(`✅ Se han eliminado ${userMessages.length} de tus últimos mensajes.`);
    } catch (error) {
      console.error("Error al ejecutar el comando 'eliminar':", error);
      await sendReply("❌ Ocurrió un error al intentar eliminar tus mensajes.");
    }
  },
};