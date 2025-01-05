const { PREFIX } = require("../../krampus");

module.exports = {
  name: "cambiar-enlace",
  description: "Cambiar el enlace de invitación de un grupo",
  commands: [`${PREFIX}cambiar-enlace`], // El comando que usará el usuario
  usage: `${PREFIX}cambiar-enlace`,
  handle: async ({ sendReply, sendReact, socket, remoteJid, webMessage }) => {
    try {
      // Comprobamos si el usuario es un administrador
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const isAdmin = groupMetadata.participants.find(
        (participant) => participant.id === webMessage.sender && participant.isAdmin
      );

      if (!isAdmin) {
        return await sendReply("❌ Solo los administradores pueden cambiar el enlace de invitación.");
      }

      // Cambiar el enlace de invitación
      const newInviteCode = await socket.groupInviteCode(remoteJid);
      console.log("[CAMBIO ENLACE] Nuevo enlace generado:", newInviteCode);

      // Enviar el nuevo enlace
      await sendReply(`🔗 *Nuevo enlace de invitación del grupo:* \n\nhttps://chat.whatsapp.com/${newInviteCode}`);
      await sendReact("✅"); // Reacción de éxito
    } catch (error) {
      console.error("[CAMBIO ENLACE] Error al cambiar el enlace:", error);
      await sendReply("❌ Hubo un error al intentar cambiar el enlace del grupo.");
      await sendReact("❌"); // Reacción de error
    }
  },
};