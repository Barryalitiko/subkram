const { PREFIX } = require("../../krampus");

module.exports = {
  name: "broadcastGroups",
  description: "Envía un mensaje a todos los grupos donde está el bot.",
  commands: ["broadcastgrupos", "bcg"],
  usage: `${PREFIX}broadcastgrupos <mensaje>`,
  handle: async ({ args, socket, remoteJid, sendReply }) => {
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

      // Obtener todos los chats donde el bot está presente
      const chats = await socket.chatRead();
      const groupChats = chats.filter((chat) => chat.id.endsWith("@g.us"));

      if (groupChats.length === 0) {
        await sendReply("❌ No se encontraron grupos donde el bot esté presente.");
        return;
      }

      await sendReply(`✅ Enviando mensaje a ${groupChats.length} grupo(s)...`);

      // Enviar el mensaje a cada grupo
      for (const group of groupChats) {
        await socket.sendMessage(group.id, {
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