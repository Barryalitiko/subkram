const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag",
  description: "Para mencionar a todos y responder a mensajes",
  commands: ["tag", "t"],
  usage: `${PREFIX}hidetag motivo`,
  handle: async ({ fullArgs, sendText, sendImageFromFile, sendImageFromURL, socket, remoteJid, sendReact, isReply, webMessage, repliedMsg }) => {
    const { participants } = await socket.groupMetadata(remoteJid);
    const mentions = participants.map(({ id }) => id);

    await sendReact("📎");

    if (isReply) {
      // Verificar que repliedMsg tiene información
      if (repliedMsg && repliedMsg.message) {
        // Verificar el tipo de contenido de la respuesta (imagen, video, texto, etc.)
        if (repliedMsg.message.imageMessage) {
          // Si el mensaje al que se respondió es una imagen
          const imageUrl = repliedMsg.message.imageMessage.url;
          const caption = fullArgs || repliedMsg.message.caption || "Sin texto"; // Si no hay texto, usa un valor por defecto

          await sendImageFromURL(imageUrl, caption); // Responde con la imagen
        } else if (repliedMsg.message.videoMessage) {
          // Si el mensaje al que se respondió es un video
          const videoUrl = repliedMsg.message.videoMessage.url;
          const caption = fullArgs || repliedMsg.message.caption || "Sin texto";

          await sendImageFromURL(videoUrl, caption); // Responde con el video
        } else if (repliedMsg.message.stickerMessage) {
          // Si el mensaje al que se respondió es un sticker
          const stickerUrl = repliedMsg.message.stickerMessage.url;
          await sendStickerFromURL(stickerUrl); // Responde con el sticker
        } else if (repliedMsg.message.conversation) {
          // Si el mensaje es de texto
          const messageText = fullArgs || repliedMsg.message.conversation || "Sin texto";

          await sendText(messageText, mentions); // Responde con el texto
        } else {
          await sendText("No se pudo detectar el tipo de medio.", mentions); // Si no se detectó ningún tipo de medio
        }
      } else {
        await sendText("No se pudo obtener el mensaje al que se respondió.", mentions); // Si no se encontró el mensaje respondido
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
