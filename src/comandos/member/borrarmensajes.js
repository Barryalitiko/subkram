const { PREFIX } = require("../../krampus");

module.exports = {
name: "eliminar",
description: "Elimina el mensaje anterior enviado por el bot",
commands: ["eliminar", "delete"],
usage: `${PREFIX}eliminar`,
handle: async ({ socket, remoteJid, sender, quotedMsg, sendReply }) => {
try {
// Verificar si se está respondiendo a un mensaje
if (!quotedMsg) {
return sendReply("❌ Debes responder a un mensaje para eliminarlo");
}

  // Verificar si el mensaje es del bot
  if (quotedMsg.sender !== process.env.BOT_NUMBER) {
    return sendReply("❌ Solo puedo eliminar mensajes enviados por mí");
  }

  // Eliminar el mensaje
  await socket.deleteMessage(remoteJid, { id: (link unavailable), fromMe: true });

  // Enviar confirmación
  await sendReply("✅ Mensaje eliminado con éxito");
} catch (error) {
  console.error("Error al ejecutar el comando 'eliminar':", error);
  await sendReply("❌ Ocurrió un error al intentar eliminar el mensaje");
}
},
};