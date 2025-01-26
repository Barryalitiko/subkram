const { PREFIX } = require("../../krampus");
const { Sticker, createSticker } = require("wa-sticker-formatter");
const fs = require("fs");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,

  handle: async ({
    isReply,
    quoted,
    downloadImage,
    downloadVideo,
    sendReply,
    sendReact,
    sendMessage,
    webMessage,
  }) => {
    try {
      // Verificar si el mensaje es una respuesta y si se adjunta una imagen o video
      if (!isReply || !quoted) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      // Verificar si el mensaje contiene una imagen o un video
      const isImage = webMessage.mtype === "imageMessage"; // Verifica si el mensaje es una imagen
      const isVideo = webMessage.mtype === "videoMessage"; // Verifica si el mensaje es un video

      if (!isImage && !isVideo) {
        await sendReply("❌ El mensaje respondido no contiene una imagen o video. Intenta nuevamente.");
        return;
      }

      // Enviar la reacción de espera
      await sendReact("🤔", webMessage.key);

      let buffer;

      // Si es una imagen
      if (isImage) {
        buffer = await downloadImage(webMessage, "input");
      } 
      // Si es un video
      else if (isVideo) {
        buffer = await downloadVideo(webMessage, "input");
      }

      if (!buffer) {
        await sendReply("❌ No se pudo descargar el archivo. Intenta nuevamente.");
        return;
      }

      // Crear el sticker
      const sticker = await createSticker(buffer, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });

      // Enviar el sticker
      await sendMessage({
        messageType: "sticker",
        url: sticker,
        caption: "Sticker creado exitosamente.",
      });

      // Enviar la reacción de éxito
      await sendReact("🧩", webMessage.key);
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};