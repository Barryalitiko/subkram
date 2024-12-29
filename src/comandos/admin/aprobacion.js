const { PREFIX } = require("../../krampus");
const GroupApproval = require("../../models/GroupApproval");

module.exports = {
  name: "aprobacion",
  description: "Activa o desactiva la aprobación de solicitudes de ingreso al grupo.",
  commands: ["aprobacion", "approval"],
  usage: `${PREFIX}aprobacion [on|off]`,
  handle: async ({ args, remoteJid, sendReply }) => {
    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      await sendReply(`Uso incorrecto. Usa el comando de esta manera:\n${PREFIX}aprobacion [on|off]`);
      return;
    }

    try {
      const groupApproval = await GroupApproval.findOne({ groupId: remoteJid });

      if (action === "on") {
        if (groupApproval && groupApproval.approvalEnabled) {
          await sendReply("✅ La aprobación de solicitudes ya está activada en este grupo.");
          return;
        }

        await GroupApproval.updateOne(
          { groupId: remoteJid },
          { approvalEnabled: true },
          { upsert: true }
        );

        await sendReply("✅ Aprobación de solicitudes activada. Las solicitudes deberán ser aprobadas manualmente.");
      } else if (action === "off") {
        if (groupApproval && !groupApproval.approvalEnabled) {
          await sendReply("✅ La aprobación de solicitudes ya está desactivada en este grupo.");
          return;
        }

        await GroupApproval.updateOne(
          { groupId: remoteJid },
          { approvalEnabled: false },
          { upsert: true }
        );

        await sendReply("❌ Aprobación de solicitudes desactivada. Los usuarios podrán unirse automáticamente.");
      }
    } catch (error) {
      console.error("Error al gestionar la aprobación de solicitudes:", error);
      await sendReply("❌ Hubo un problema al gestionar la aprobación de solicitudes. Inténtalo de nuevo.");
    }
  },
};