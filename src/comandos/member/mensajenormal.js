const { PREFIX } = require("../../krampus");

module.exports = {
  name: "normal",
  description: "Envía un mensaje normal.",
  commands: ["normal"],
  usage: `${PREFIX}normal`,
  handle: async ({ sendReply }) => {
    try {
      await sendReply("Este es un mensaje normal.");
    } catch (error) {
      console.error("Error al enviar mensaje normal:", error);
      await sendReply("Ocurrió un error al intentar enviar el mensaje normal.");
    }
  },
};