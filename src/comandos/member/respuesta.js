const { PREFIX } = require("../../krampus");

module.exports = {
  name: "respuesta",
  description: "Responder a una propuesta de matrimonio.",
  commands: ["#r si", "#r no"],
  usage: `${PREFIX}#r si` || `${PREFIX}#r no`,
  handle: async ({ sendReply, userJid, args, isReply, replyJid, client, remoteJid, mentionedJid }) => {
    // Obtener el JID de la persona a la que se le pidió matrimonio
    const targetJid = mentionedJid;

    // Verificar que la persona que responde sea la misma persona a la que se le pidió matrimonio
    if (userJid !== targetJid) {
      await sendReply("Solo la persona a la que se le pidió matrimonio puede responder.");
      return;
    }

    // Maneja la respuesta "#r si" o "#r no"
    if (args[0] === "#r si") {
      // Aceptar la propuesta de matrimonio
      // Agregar código aquí para aceptar la propuesta de matrimonio
    } else if (args[0] === "#r no") {
      // Rechazar la propuesta de matrimonio
      // Agregar código aquí para rechazar la propuesta de matrimonio
    }
  },
};
