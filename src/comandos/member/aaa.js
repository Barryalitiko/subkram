const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Envia un texto con un enlace como previsualización",
  commands: ["tag", "c"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendText, sendReact }) => {
    // El enlace de prueba (puedes usar cualquier enlace válido)
    const hiddenLink = "https://wa.me/1234567890"; // Enlace visible en el texto

    // Generar el mensaje con el texto y el enlace visible entre los signos < >
    const messageText = `<${hiddenLink}> ${fullArgs}`;

    await sendReact("📎"); // Puedes usar cualquier emoji como reacción

    // Enviar el mensaje con el enlace visible
    await sendText(messageText);
  },
};