const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Envía un texto con un enlace oculto pero con previsualización",
  commands: ["tag", "c"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendReact, socket, remoteJid }) => {
    const hiddenLink = "https://chat.whatsapp.com/CKGdQzPqKH95x0stiUZpFs"; // Enlace real

    await sendReact("📎"); // Reacciona con un emoji

    await socket.sendMessage(remoteJid, {
      text: `${hiddenLink}\n\nHola\n\n${fullArgs}`, // Poner el enlace primero
      linkPreview: true, // Forzar previsualización
    });
  },
};