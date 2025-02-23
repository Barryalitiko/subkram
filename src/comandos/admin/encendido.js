const { PREFIX } = require("../../krampus");
const { activateGroup, deactivateGroup } = require("../../utils/database");

module.exports = {
  name: "bot",
  description: "Enciende o apaga el bot en un grupo",
  commands: ["bot"],
  usage: `${PREFIX}bot [on/off]`,
  
  handle: async ({ sendSuccessReply, remoteJid, args }) => {
    if (!args.length) {
      return sendSuccessReply("Debes especificar 'on' o 'off'.");
    }

    const option = args[0].trim().toLowerCase();

    if (option !== "on" && option !== "off") {
      return sendSuccessReply("Opción inválida. Usa 'on' o 'off'.");
    }

    try {
      if (option === "on") {
        await activateGroup(remoteJid);
        await sendSuccessReply("✅ Bot encendido.");
      } else {
        await deactivateGroup(remoteJid);
        await sendSuccessReply("❌ Bot apagado.");
      }
    } catch (error) {
      await sendSuccessReply("⚠️ Ocurrió un error al cambiar el estado del bot.");
      console.error("Error en el comando 'bot':", error);
    }
  },
};