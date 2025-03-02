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
      text: enlace,  // El enlace ahora debería ser enviado con la previsualización
      url: enlace,   // Aseguramos que la url se pasa correctamente
    });
  },
};