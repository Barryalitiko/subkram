const { PREFIX } = require("../../krampus");
const { setAutoApprove } = require("../utils/database");
const { sendReply, sendSuccessReact, sendErrorReply, sendWaitReact } = require("../utils");

module.exports = {
  name: "aprobarautomatico",
  description: "Activar o desactivar la aprobación automática de solicitudes.",
  commands: ["aprobarautomatico"],
  usage: `${PREFIX}aprobarautomatico <activar/desactivar>`,
  handle: async ({ socket, remoteJid, sendReply, args }) => {
    try {
      // Comprobamos si el argumento es 'activar' o 'desactivar'
      const action = args[0]?.toLowerCase();
      if (action !== "activar" && action !== "desactivar") {
        await sendReply("❌ Por favor, usa 'activar' o 'desactivar' para controlar la aprobación automática.");
        return;
      }

      // Activamos o desactivamos la aprobación automática
      const success = await setAutoApprove(remoteJid, action === "activar");

      if (success) {
        await sendSuccessReact(remoteJid);
        await sendReply(`✅ Aprobación automática de solicitudes ${action === "activar" ? "activada" : "desactivada"} para este grupo.`);
      } else {
        await sendErrorReply("❌ Hubo un error al intentar cambiar la configuración de aprobación automática.");
      }
    } catch (error) {
      console.error("Error al activar/desactivar aprobación automática:", error);
      await sendErrorReply("❌ Hubo un error al procesar tu solicitud.");
    }
  }
};