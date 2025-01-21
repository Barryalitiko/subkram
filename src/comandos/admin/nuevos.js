const { activateAutoApproveGroup, deactivateAutoApproveGroup, isActiveAutoApproveGroup } = require("../../utils/database");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "autoapprove",
  description: "Activar o desactivar la aprobación automática de solicitudes en el grupo",
  commands: ["autoapprove"],
  usage: `${PREFIX}autoapprove <on|off>`,
  handle: async ({ socket, remoteJid, sendReply, args }) => {
    const action = args[0];

    if (!action || (action !== "on" && action !== "off")) {
      await sendReply("❌ Por favor, especifica si deseas activar o desactivar la aprobación automática (`on` o `off`).");
      return;
    }

    if (action === "on") {
      activateAutoApproveGroup(remoteJid);
      await sendReply("✅ La aprobación automática está ahora activada para este grupo.");
    } else if (action === "off") {
      deactivateAutoApproveGroup(remoteJid);
      await sendReply("❌ La aprobación automática está ahora desactivada para este grupo.");
    }
  }
};