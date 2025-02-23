const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Envía un texto con un enlace oculto pero con previsualización",
  commands: ["tag", "c"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendReact, socket, remoteJid }) => {
    const hiddenLink = "https://chat.whatsapp.com/CKGdQzPqKH95x0stiUZpFs"; // Enlace real

    await sendReact("📎"); // Reacciona con un emoji

    // Enviar el enlace primero para generar la previsualización
    await socket.sendMessage(remoteJid, {
      text: hiddenLink,
      linkPreview: true,
    });

    // Esperar 3-5 segundos para dar tiempo a que WhatsApp genere la previsualización
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Enviar el mensaje de texto después de la previsualización
    await socket.sendMessage(remoteJid, {
      text: `Hola\n\n${fullArgs}`,
    });
  },
};