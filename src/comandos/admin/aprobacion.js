const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const approvalConfigPath = path.join(__dirname, "../../data/groupApprovalConfig.json");

const readApprovalConfig = () => {
  if (fs.existsSync(approvalConfigPath)) {
    const rawData = fs.readFileSync(approvalConfigPath);
    return JSON.parse(rawData);
  }
  return {};
};

const writeApprovalConfig = (data) => {
  fs.writeFileSync(approvalConfigPath, JSON.stringify(data, null, 2));
};

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

    const groupApprovalConfig = readApprovalConfig();

    if (action === "on") {
      if (groupApprovalConfig[remoteJid]?.approvalEnabled) {
        await sendReply("✅ La aprobación de solicitudes ya está activada.");
        return;
      }

      groupApprovalConfig[remoteJid] = { approvalEnabled: true };
      writeApprovalConfig(groupApprovalConfig);

      await sendReply("✅ Aprobación de solicitudes activada.");
    } else if (action === "off") {
      if (!groupApprovalConfig[remoteJid]?.approvalEnabled) {
        await sendReply("✅ La aprobación de solicitudes ya está desactivada.");
        return;
      }

      groupApprovalConfig[remoteJid] = { approvalEnabled: false };
      writeApprovalConfig(groupApprovalConfig);

      await sendReply("❌ Aprobación de solicitudes desactivada.");
    }
  },
};