const { PREFIX } = require("../../krampus");

module.exports = {
  name: "groupLink",
  description: "Envía el enlace del grupo.",
  commands: ["link", "enlace"],
  usage: `${PREFIX}link`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      // Obtener el enlace del grupo
      const inviteCode = await socket.groupInviteCode(remoteJid);

      if (inviteCode) {
        const groupLink = `https://chat.whatsapp.com/${inviteCode}`;
        await sendReply(`Aquí tienes el enlace del grupo:\n${groupLink}`);
      } else {
        await sendReply("No se pudo obtener el enlace del grupo.");
      }
    } catch (error) {
      console.error("Error al obtener el enlace del grupo:", error.message);
      await sendReply("Ocurrió un error al intentar obtener el enlace del grupo.");
    }
  },
};