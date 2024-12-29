const { PREFIX } = require("../../krampus");

module.exports = {
  name: "grupodesc",
  description: "Envía la descripción del grupo",
  commands: ["grupodesc", "descripciongrupo"],
  usage: `${PREFIX}grupodesc`,
  handle: async ({ sendText, remoteJid, socket, sendReact }) => {
    try {
      // Agregamos una reacción para indicar que el comando está procesando
      await sendReact("📄");

      // Obtener los metadatos del grupo
      const groupMetadata = await socket.groupMetadata(remoteJid);

      // Verificar si el grupo tiene una descripción
      const groupDesc = groupMetadata.desc || "Este grupo no tiene descripción.";

      // Enviar la descripción al grupo
      await sendText(
        remoteJid,
        `📜 *Descripción del grupo*:\n\n${groupDesc}`
      );
    } catch (error) {
      console.error("Error al obtener la descripción del grupo:", error);
      await sendText(
        remoteJid,
        "⚠️ Ocurrió un error al intentar obtener la descripción del grupo."
      );
    }
  },
};