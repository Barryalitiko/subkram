const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Envía un texto con un enlace como previsualización",
  commands: ["tag", "c"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendReact, socket, remoteJid }) => {
    const hiddenLink = "https://www.example.com"; // Cambia esto por el enlace real

    await sendReact("📎"); // Reacciona con un emoji

    await socket.sendMessage(remoteJid, {
      text: `${fullArgs} ${hiddenLink}`,
      linkPreview: true, // Intenta generar una previsualización
    });
  },
};