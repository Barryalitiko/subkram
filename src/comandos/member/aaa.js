const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Envía un texto con un enlace oculto pero con previsualización",
  commands: ["tag", "c"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendReact, socket, remoteJid, delay }) => {
    const hiddenLink = "https://chat.whatsapp.com/CKGdQzPqKH95x0stiUZpFs"; // Enlace real

    await sendReact("📎"); // Reacciona con un emoji

    // Enviar solo el enlace para que WhatsApp genere la previsualización
    await socket.sendMessage(remoteJid, {
      text: hiddenLink,
      linkPreview: true,
    });

    // Esperar 2 segundos antes de enviar el mensaje de texto
    await delay(2000);

    // Enviar el mensaje de texto sin el enlace
    await socket.sendMessage(remoteJid, {
      text: `Hola\n\n${fullArgs}`,
    });
  },
};