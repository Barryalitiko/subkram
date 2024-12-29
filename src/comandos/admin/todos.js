const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Menciona a todos los participantes del grupo de forma oculta.",
  commands: ["krampus-bot", "todos", "hidetag"],
  usage: `${PREFIX}hidetag <motivo>`,
  handle: async ({ fullArgs, sendText, socket, remoteJid, sendReact }) => {
    try {
      // Obtener la lista de participantes del grupo
      const { participants } = await socket.groupMetadata(remoteJid);

      // Crear una lista de menciones con los IDs de los participantes
      const mentions = participants.map(({ id }) => id);

      // Enviar una reacción para confirmar el comando
      await sendReact("👻");

      // Generar un mensaje llamativo para mencionar a todos
      const message = `
📣 *¡Atención, grupo!* 📣
────────────────────
👻 *𝙺𝚛𝚊𝚖𝚙𝚞𝚜 𝙱𝚘𝚝* 👻 está llamando a *TODOS*:

_${fullArgs || "Sin motivo especificado, pero parece importante..."}_

🔔 *¡Responde si estás presente!* 🔔
────────────────────`;

      // Enviar el mensaje con menciones ocultas
      await sendText(message, mentions);
    } catch (error) {
      console.error("Error al ejecutar el comando hide-tag:", error);
      await sendText("❌ Ocurrió un error al intentar mencionar a todos.");
    }
  },
};