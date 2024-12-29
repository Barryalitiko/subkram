const { PREFIX } = require("../../krampus");

module.exports = {
  name: "broadcastGroups",
  description: "Envía un mensaje a todos los grupos donde está el bot.",
  commands: ["broadcastgrupos", "bcg"],
  usage: `${PREFIX}broadcastgrupos <mensaje>`,
  handle: async ({ args, socket, sendReply }) => {
    try {
      if (args.length < 1) {
        await sendReply(
          "Uso incorrecto. Usa el comando así:\n" +
          `${PREFIX}broadcastgrupos <mensaje>`
        );
        return;
      }

      // Mensaje a enviar
      const mensaje = args.join(" ");

      // Obtener todos los chats activos del bot
      const chats = await socket.groupFetchAllParticipating();
      const groupChats = Object.keys(chats);

      if (groupChats.length === 0) {
        await sendReply("❌ No se encontraron grupos donde el bot esté presente.");
        return;
      }

      await sendReply(`✅ Enviando mensaje a ${groupChats.length} grupo(s)...`);

      // Enviar el mensaje a cada grupo
      for (const groupId of groupChats) {
        await socket.sendMessage(groupId, {
          text: mensaje,
        });
      }

      await sendReply("✅ Mensaje enviado a todos los grupos.");
    } catch (error) {
      console.error("Error al enviar el mensaje a los grupos:", error.message);
      await sendReply("❌ Ocurrió un error al enviar el mensaje.");
    }
  },
};