const { isSpamDetectionActive, activateSpamDetection, deactivateSpamDetection } = require("../../utils/database");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "spam",
  description: "Activa o desactiva la detección de spam en el grupo.",
  commands: ["spam"],
  usage: `${PREFIX}spam on / ${PREFIX}spam off`,

  handle: async ({ socket, remoteJid, sendReply, args }) => {
    if (!args.length) {
      return sendReply(`Uso incorrecto. Usa:\n- *${PREFIX}spam on* para activar\n- *${PREFIX}spam off* para desactivar`);
    }

    const action = args[0].toLowerCase();

    if (action === "on") {
      activateSpamDetection(remoteJid);
      sendReply("✅ La detección de spam ha sido ACTIVADA en este grupo.");
    } else if (action === "off") {
      deactivateSpamDetection(remoteJid);
      sendReply("🚫 La detección de spam ha sido DESACTIVADA en este grupo.");
    } else {
      sendReply(`❌ Opción inválida. Usa *${PREFIX}spam on* o *${PREFIX}spam off*.`);
    }
  },
};