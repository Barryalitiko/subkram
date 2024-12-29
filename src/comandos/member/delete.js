const { PREFIX } = require("../../config");

module.exports = {
  name: "delete",
  description: "Permite eliminar un mensaje enviado por el bot cuando se reacciona a él.",
  commands: ["del"],
  usage: `${PREFIX}delete`,
  handle: async ({ socket, sendReact }) => {
    try {
      // Este comando se activará únicamente por una reacción en un mensaje del bot
      await sendReact("👻");
      await sendReply("¡Este comando funciona automáticamente cuando reaccionas a un mensaje del bot!");
    } catch (error) {
      console.error("Error al ejecutar el comando 'delete':", error);
    }
  },

  // Middleware o escucha para las reacciones
  onReaction: async ({ reaction, socket }) => {
    try {
      const { key, text } = reaction.message;
      const botJid = socket.user.id; // El JID del bot

      // Verificamos si la reacción es a un mensaje del bot
      if (key.fromMe) {
        // Eliminamos el mensaje del bot que fue reaccionado
        await socket.deleteMessage(key.remoteJid, { id: key.id, fromMe: true });
      }
    } catch (error) {
      console.error("Error al procesar la reacción para eliminar el mensaje:", error);
    }
  },
};