const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Envia un texto con un enlace invisible",
  commands: ["tag", "c"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendText, sendReact }) => {
    // El enlace de prueba (puedes usar cualquier enlace válido de WhatsApp u otro sitio)
    const hiddenLink = "https://wa.me/1234567890"; // Enlace oculto

    // Generar el mensaje con el texto y el enlace escondido
    const messageText = `${fullArgs} <${hiddenLink}>`;

    await sendReact("📎"); // Puedes usar cualquier emoji como reacción

    // Enviar el mensaje con el enlace "escondido"
    await sendText(messageText);
  },
};