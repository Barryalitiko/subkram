const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Para mencionar a todos y responder a mensajes",
  commands: ["tag", "t"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendText, sendImage, socket, remoteJid, sendReact, isReply, isImage, repliedMsg }) => {
    const { participants } = await socket.groupMetadata(remoteJid);
    const mentions = participants.map(({ id }) => id);
    
    await sendReact("📎");

    if (isReply) {
      // Responde con el texto o imagen al mensaje original
      if (isImage) {
        const image = repliedMsg.imageUrl; // Obtén la URL de la imagen del mensaje respondido
        const caption = fullArgs || repliedMsg.text; // Usa el texto después de tag o el texto original
        await sendImage(image, caption, mentions);
      } else {
        // Si es solo texto, responde con el texto que sigue al comando
        const messageText = fullArgs || repliedMsg.text;
        await sendText(messageText, mentions);
      }
    } else {
      // Si no es respuesta, pero tiene texto después del comando
      if (fullArgs) {
        await sendText(fullArgs, mentions);
      } else {
        // Si no hay texto después del comando, responde con el último mensaje
        await sendText(repliedMsg.text, mentions);
      }
    }
  },
};
