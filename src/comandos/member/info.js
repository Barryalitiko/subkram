const { PREFIX } = require("../../krampus"); // Para acceder al prefix

module.exports = {
  name: "grupos",
  description: "Obtener información de los grupos donde está el bot",
  commands: ["grupos", "grupos-info"],
  usage: `${PREFIX}grupos`,
  cooldown: 60, // 1 minuto de cooldown
  handle: async ({ socket, sendReply, sendReact }) => {
    try {
      await sendReact("⏳"); // Reacciona con el emoji de espera

      const groupMetadata = await socket.groupFetchAllParticipating(); // Obtener todos los grupos
      const groupsInfo = Object.values(groupMetadata);

      if (!groupsInfo.length) {
        await sendReply("El bot no está en ningún grupo.");
        return;
      }

      let response = `👥 *Información de Grupos:* 👥\n\n`;

      for (const group of groupsInfo) {
        const groupName = group.subject || "Sin Nombre";
        const groupLink = await socket.groupInviteCode(group.id);
        const groupUsers = group.participants?.length || 0;

        response += `🌟 *Nombre del Grupo:* ${groupName}\n`;
        response += `🔗 *Enlace:* https://chat.whatsapp.com/${groupLink}\n`;
        response += `👤 *Usuarios:* ${groupUsers}\n\n`;
      }

      await sendReply(response);
      await sendReact("✅"); // Reacciona con el emoji de éxito
    } catch (error) {
      console.error("[GRUPOS] Error al obtener información de los grupos:", error);
      await sendReply("Hubo un error al intentar obtener la información de los grupos.");
      await sendReact("❌"); // Reacciona con el emoji de error
    }
  },
};