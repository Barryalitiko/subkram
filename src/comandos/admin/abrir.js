const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const groupStatusPath = path.join(__dirname, "../../assets/groupStatus.json");

module.exports = {
  name: "abrir",
  description: "Abre el grupo para que todos los miembros puedan enviar mensajes.",
  commands: ["abrir"],
  usage: `${PREFIX}abrir`,
  handle: async ({ remoteJid, isGroup, sendReply, socket }) => {
    try {
      if (!isGroup) {
        await sendReply("❌ Este comando solo puede usarse en grupos.");
        return;
      }

      // Leer el estado actual del grupo
      const groupStatus = JSON.parse(fs.readFileSync(groupStatusPath, "utf8"));

      // Verificar si el grupo ya está abierto
      if (groupStatus[remoteJid]?.closed === false) {
        await sendReply("❌ El grupo ya está abierto.");
        return;
      }

      // Actualizar la configuración del grupo
      await socket.groupSettingUpdate(remoteJid, "not_announcement");

      // Guardar el estado actualizado
      groupStatus[remoteJid] = { closed: false };
      fs.writeFileSync(groupStatusPath, JSON.stringify(groupStatus, null, 2));

      await sendReply("✅ El grupo ha sido abierto. Ahora todos los miembros pueden enviar mensajes.");
    } catch (error) {
      console.error("Error al abrir el grupo:", error);
      await sendReply("❌ Ocurrió un error al intentar abrir el grupo.");
    }
  },
};