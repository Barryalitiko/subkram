const { PREFIX } = require("../../krampus");
const { setOnlyAdmin, removeOnlyAdmin } = require("../../utils/database");

module.exports = {
  name: "soloadmin",
  description: "Restringe el uso del bot solo a administradores",
  commands: ["soloadmin"],
  usage: `${PREFIX}soloadmin [on/off]`,
  
  handle: async ({ sendSuccessReply, remoteJid, args, socket }) => {
    if (!remoteJid.endsWith("@g.us")) {
      return sendSuccessReply("Este comando solo puede usarse en grupos.");
    }

    if (!args.length) {
      return sendSuccessReply("Debes especificar 'on' o 'off'.");
    }

    const option = args[0].trim().toLowerCase();
    if (option !== "on" && option !== "off") {
      return sendSuccessReply("Opción inválida. Usa 'on' o 'off'.");
    }

    try {
      // Activar o desactivar el modo "solo admin"
      if (option === "on") {
        await setOnlyAdmin(remoteJid);
        await sendSuccessReply("✅ El bot ahora solo responderá a administradores.");
      } else {
        await removeOnlyAdmin(remoteJid);
        await sendSuccessReply("❌ El bot ahora responderá a todos los miembros.");
      }
    } catch (error) {
      await sendSuccessReply("⚠️ Ocurrió un error al cambiar la configuración.");
      console.error("Error en el comando 'soloadmin':", error);
    }
  },
};