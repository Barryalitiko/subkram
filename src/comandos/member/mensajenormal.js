const { PREFIX } = require("../../krampus");

module.exports = {
  name: "reenviado",
  description: "Envía un mensaje como si estuviera reenviado.",
  commands: ["reenviado"],
  usage: `${PREFIX}reenviado`,
  handle: async ({ sendReply }) => {
    try {
      // Simulamos el mensaje reenviado
      await sendReply("🔁 *Reenviado*\n\nEste mensaje parece reenviado.");
    } catch (error) {
      console.error("Error al enviar mensaje reenviado:", error);
      await sendReply("Ocurrió un error al intentar enviar el mensaje reenviado.");
    }
  },
};