const { PREFIX } = require("../../krampus");

module.exports = {
  name: "botones",
  description: "Envía un mensaje con botones interactivos",
  commands: ["botones"],
  usage: `${PREFIX}botones`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      // Crear el mensaje con botones
      const buttonMessage = {
        caption: "Selecciona una opción:", // Mensaje que aparecerá antes de los botones
        buttons: [
          { buttonId: "opcion1", buttonText: { displayText: "Opción 1" } },
          { buttonId: "opcion2", buttonText: { displayText: "Opción 2" } },
          { buttonId: "opcion3", buttonText: { displayText: "Opción 3" } },
        ],
        headerType: 1,  // Opcional, tipo de cabecera del mensaje
      };

      // Enviar el mensaje con botones
      await socket.sendMessage(remoteJid, buttonMessage);

      console.log("Mensaje con botones enviado correctamente.");
    } catch (error) {
      console.error("❌ Error al enviar el mensaje con botones:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje con botones.");
    }
  },
};
