const { PREFIX } = require("../../krampus");

module.exports = {
  name: "linkgrupo",
  description: "Obtén el enlace del grupo si el bot es administrador.",
  commands: ["linkgrupo", "grouplink"],
  usage: `${PREFIX}linkgrupo`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      // Verificar si es un grupo
      if (!remoteJid.endsWith("@g.us")) {
        await sendReply("Este comando solo funciona en grupos.");
        return;
      }

      // Obtener información del grupo
      const groupMetadata = await socket.groupMetadata(remoteJid);

      // Verificar si el bot es administrador
      const isBotAdmin = groupMetadata.participants.some(
        (participant) =>
          participant.id === socket.user.id && participant.admin
      );

      if (!isBotAdmin) {
        await sendReply("No soy administrador, no puedo generar el enlace del grupo.");
        return;
      }

      // Generar el enlace del grupo
      const groupLink = await socket.groupInviteCode(remoteJid);
      if (groupLink) {
        const inviteLink = `https://chat.whatsapp.com/${groupLink}`;
        await sendReply(`Aquí está el enlace del grupo:\n${inviteLink}`);
      } else {
        await sendReply("No se pudo generar el enlace del grupo.");
      }
    } catch (error) {
      console.error("Error al obtener el enlace del grupo:", error);
      await sendReply("Ocurrió un error al intentar obtener el enlace del grupo.");
    }
  },
};