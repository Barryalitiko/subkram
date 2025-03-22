const { PREFIX } = require("../../krampus");

let autoDeleteUsers = new Set();

module.exports = {
  name: "autodelete",
  description: "Activa o desactiva la autoeliminación de mensajes para un usuario.",
  commands: ["autodelete", "autodel", "autod"],
  usage: `${PREFIX}autodelete @usuario`,

  handle: async ({ sendReply, sendReact, webMessage }) => {
    await sendReact("🗑️");

    if (!webMessage.message.extendedTextMessage || !webMessage.message.extendedTextMessage.contextInfo) {
      return await sendReply("✳️ *Responde a un mensaje del usuario que quieres silenciar.*");
    }

    try {
      const targetUser = webMessage.message.extendedTextMessage.contextInfo.participant;
      if (!targetUser) return await sendReply("❌ *No se pudo identificar al usuario.*");

      if (autoDeleteUsers.has(targetUser)) {
        autoDeleteUsers.delete(targetUser);
        return await sendReply(`🚫 *Autoeliminación desactivada para @${targetUser.split('@')[0]}*`, [targetUser]);
      } else {
        autoDeleteUsers.add(targetUser);
        return await sendReply(`✅ *Autoeliminación activada para @${targetUser.split('@')[0]}*`, [targetUser]);
      }
    } catch (error) {
      console.error("Error al gestionar autoeliminación:", error);
      await sendReply("❌ *Ocurrió un error.*");
    }
  },

  onMessage: async ({ webMessage, socket, remoteJid }) => {
    if (!webMessage.key || !webMessage.key.participant) return;

    const sender = webMessage.key.participant;

    if (autoDeleteUsers.has(sender)) {
      try {
        // Esperamos un poco para que el mensaje aparezca y luego lo eliminamos
        setTimeout(async () => {
          await socket.sendMessage(remoteJid, {
            delete: webMessage.key, // Eliminamos el mensaje del usuario
          });
          console.log(`🗑️ Mensaje de ${sender} eliminado automáticamente.`);
        }, 1000); // Espera 1 segundo antes de eliminar el mensaje

      } catch (error) {
        console.error("Error al eliminar mensaje automáticamente:", error);
      }
    }
  },
};

