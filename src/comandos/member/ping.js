const { PREFIX } = require("../../krampus");

const OFFICIAL_WHATSAPP_ID = '0@s.whatsapp.net';

module.exports = {
name: "ping",
description: "Verificar si el bot está online",
commands: ["ping"],
usage: `${PREFIX}ping`,
handle: async ({ socket, remoteJid, sendReply, message }) => {
try {
const quotedMessage = message?.quoted?.message;
if (quotedMessage && typeof quotedMessage === 'object') {
const quotedMessageContext = {
participant: OFFICIAL_WHATSAPP_ID,
quotedMessage: quotedMessage,
quotedParticipant: OFFICIAL_WHATSAPP_ID,
};

    const pingResponse = "🏓 Pong! El bot está online.";
    await socket.sendMessage(remoteJid, {
      text: pingResponse,
      contextInfo: quotedMessageContext,
    });
    console.log(`Mensaje de respuesta enviado: ${pingResponse}`);
  } else {
    const pingResponse = "🏓 Pong! El bot está online.";
    await socket.sendMessage(remoteJid, { text: pingResponse });
    console.log(`Mensaje de respuesta enviado: ${pingResponse}`);
  }
  sendReply("Ping enviado correctamente como un mensaje reenviado.");
} catch (error) {
  console.error("❌ Error en el comando ping:", error);
  sendReply("⚠️ Ocurrió un error al intentar enviar el mensaje.");
}
},
};