const { PREFIX } = require("../../krampus");

module.exports = {
  name: "contacto",
  description: "Envía el número de un contacto mencionado o respondido.",
  commands: [`${PREFIX}contacto`],
  usage: `${PREFIX}contacto`,
  handle: async ({ socket, sendReply, isReply, webMessage, remoteJid }) => {
    try {
      if (isReply) {
        // Si el mensaje es una respuesta
        const repliedMessage = webMessage.message[Object.keys(webMessage.message)[0]];
        const contact = repliedMessage?.userJid; // Extraemos el Jid del contacto respondido

        if (!contact) {
          return await sendReply("No se pudo obtener el número del contacto.");
        }

        // Enviar el número de teléfono como contacto
        await socket.sendMessage(remoteJid, {
          contact: {
            displayName: "Contacto Respondido", // Nombre del contacto
            jid: contact, // Número del contacto
          },
        });
        await sendReply("El número del contacto ha sido enviado.");
      } else {
        // Si el mensaje no es una respuesta, enviar un mensaje de error
        await sendReply("Por favor, responde a un mensaje o menciona a un contacto.");
      }
    } catch (error) {
      console.error("[CONTACTO] Error al obtener el número del contacto:", error);
      await sendReply("❌ Ocurrió un error al intentar obtener el número del contacto.");
    }
  },
};