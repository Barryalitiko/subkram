const { PREFIX } = require("../../krampus");

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendMessage }) => {
    const enlace = "https://chat.whatsapp.com/CKGdQzPqKH95x0stiUZpFs";

    await sendMessage({
      messageType: "text",
      text: enlace,
      linkPreview: true,  // 💡 Ahora debería habilitar la previsualización
    });
  },
};