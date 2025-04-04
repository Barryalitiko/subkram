const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Para mencionar a todos y responder a mensajes",
  commands: ["tag", "t"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendText, sendImageFromFile, sendImageFromURL, socket, remoteJid, sendReact, isReply, isImage, isVideo, isSticker, repliedMsg }) => {
    const { participants } = await socket.groupMetadata(remoteJid);
    const mentions = participants.map(({ id }) => id);

    await sendReact("📎");

    if (isReply) {
      // Si se está respondiendo a un mensaje
      if (repliedMsg) {
        if (isImage) {
          // Si el mensaje original es una imagen
          const imageUrl = repliedMsg.imageUrl;
          const caption = fullArgs || repliedMsg.text; // Usar el texto del comando o el original

          await sendImageFromURL(imageUrl, caption); // Responde con la misma imagen y el texto
        } else if (isVideo) {
          // Si el mensaje original es un video
          const videoUrl = repliedMsg.videoUrl;
          const caption = fullArgs || repliedMsg.text; // Usar el texto del comando o el original

          await sendImageFromURL(videoUrl, caption); // Enviar el video con el texto
        } else if (isSticker) {
          // Si el mensaje original es un sticker
          const stickerUrl = repliedMsg.stickerUrl;
          const caption = fullArgs || repliedMsg.text; // Usar el texto del comando o el original

          await sendStickerFromURL(stickerUrl); // Responder con el mismo sticker
        } else {
          // Si es un mensaje de texto normal
          const messageText = fullArgs || repliedMsg.text; // Usar el texto del comando o el original
          await sendText(messageText, mentions); // Responder con el texto
        }
      } else {
        await sendText("No se pudo obtener el mensaje al que se respondió.", mentions);
      }
    } else {
      // Si no se está respondiendo, pero hay un texto después del comando
      if (fullArgs) {
        await sendText(fullArgs, mentions);
      } else {
        // Si no hay texto, responde con un mensaje genérico
        await sendText("No se proporcionó texto al usar el comando.", mentions);
      }
    }
  },
};
