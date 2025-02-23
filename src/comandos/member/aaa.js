const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Envia un texto con un enlace como previsualización",
  commands: ["tag", "c"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendReact, socket, jid }) => {
    const hiddenLink = "https://wa.me/1234567890"; // Enlace visible en el texto
    const messageText = `<${hiddenLink}> ${fullArgs}`;

    await sendReact("📎"); // Reacciona con un emoji

    // Enviar el mensaje usando socket.sendMessage
    await socket.sendMessage(jid, { text: messageText });
  },
};