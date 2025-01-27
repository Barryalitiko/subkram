const { PREFIX } = require("../../krampus");
const { Sticker, createSticker } = require("wa-sticker-formatter");
const fs = require("fs");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,

  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    webMessage,
    sendReply,
    sendReact,
    sendMessage,
    isReply,
    quoted,
  }) => {
    try {
      if (!isReply || !quoted) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      // Detectamos si es una imagen o un video
      if (!isImage && !isVideo) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      // Evitar que se envíe la imagen de vuelta
      await sendReact("🤔", webMessage.key); // Reaccionamos al mensaje

      let buffer;

      // Si es una imagen
      if (isImage) {
        console.log("Imagen detectada");
        buffer = await downloadImage(webMessage, "input");
      } 
      // Si es un video
      else if (isVideo) {
        console.log("Video detectado");
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
      await sendMessage(webMessage.key.remoteJid, {
        sticker: sticker,
        quoted: webMessage,
      });

      await sendReact("🧩", webMessage.key); // Reacción después de crear el sticker
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};