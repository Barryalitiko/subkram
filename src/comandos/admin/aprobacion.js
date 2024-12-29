const { PREFIX } = require("../../krampus");
const GroupApproval = require("../../models/GroupApproval");

module.exports = {
  name: "aprobacion",
  description: "Activa o desactiva la aprobación automática de solicitudes.",
  commands: ["aprobacion", "approval"],
  usage: `${PREFIX}aprobacion [on|off]`,
  handle: async ({ args, remoteJid, sendReply }) => {
    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      await sendReply(`Uso incorrecto. Usa el comando así:\n${PREFIX}aprobacion [on|off]`);
      return;
    }

    try {
      const groupApproval = await GroupApproval.findOne({ groupId: remoteJid });

      if (action === "on") {
        if (groupApproval && groupApproval.approvalEnabled) {
          await sendReply("✅ La aprobación automática ya está activada en este grupo.");
          return;
        }

        await GroupApproval.updateOne(
          { groupId: remoteJid },
          { approvalEnabled: true },
          { upsert: true }
        );

        await sendReply("✅ Aprobación automática activada. El bot aceptará todas las solicitudes.");
      } else if (action === "off") {
        if (groupApproval && !groupApproval.approvalEnabled) {
          await sendReply("✅ La aprobación automática ya está desactivada en este grupo.");
          return;
        }

        await GroupApproval.updateOne(
          { groupId: remoteJid },
          { approvalEnabled: false },
          { upsert: true }
        );

        await sendReply("❌ Aprobación automática desactivada. Los usuarios se unirán automáticamente.");
      }
    } catch (error) {
      console.error("Error al gestionar la aprobación automática:", error);
      await sendReply("❌ Hubo un problema al gestionar la aprobación automática. Inténtalo de nuevo.");
    }
  },
};