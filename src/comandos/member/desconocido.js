const { PREFIX } = require("../../krampus");

module.exports = {
  name: "unknownCommand",
  description: "Responde a comandos desconocidos",
  handle: async ({ message, sendReply, socket }) => {
    const remoteJid = message.key.remoteJid;

    // Responder con el mensaje de ayuda
    await sendReply("Usa #menu para ver la lista de comandos.");

    // Reaccionar al mensaje
    await socket.sendMessage(remoteJid, {
      react: {
        text: "❓", // Emoji para la reacción
        key: message.key,
      },
    });
  },
};