const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const groupStatusPath = path.join(__dirname, "../../assets/groupStatus.json");

module.exports = {
  name: "cerrar",
  description: "Cierra el grupo para que solo los administradores puedan enviar mensajes.",
  commands: ["cerrar"],
  usage: `${PREFIX}cerrar`,
  handle: async ({ remoteJid, isGroup, sendReply, socket }) => {
    try {
      if (!isGroup) {
        await sendReply("❌ Este comando solo puede usarse en grupos.");
        return;
      }

      // Leer el estado actual del grupo
      const groupStatus = JSON.parse(fs.readFileSync(groupStatusPath, "utf8"));

      // Verificar si el grupo ya está cerrado
      if (groupStatus[remoteJid]?.closed) {
        await sendReply("❌ El grupo ya está cerrado.");
        return;
      }

      // Actualizar la configuración del grupo
      await socket.groupSettingUpdate(remoteJid, "announcement");

      // Guardar el estado actualizado
      groupStatus[remoteJid] = { closed: true };
      fs.writeFileSync(groupStatusPath, JSON.stringify(groupStatus, null, 2));

      await sendReply("✅ El grupo ha sido cerrado. Solo los administradores pueden enviar mensajes.");
    } catch (error) {
      console.error("Error al cerrar el grupo:", error);
      await sendReply("❌ Ocurrió un error al intentar cerrar el grupo.");
    }
  },
};