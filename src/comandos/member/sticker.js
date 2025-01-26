const { PREFIX } = require("../../krampus");
const { Sticker, createSticker } = require("wa-sticker-formatter");
const fs = require("fs");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,

  handle: async ({
    webMessage,
    sendReply,
    sendReact,
    sendMessage,
    args,
    isReply,
    quoted,
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
  }) => {
    try {
      if (!isReply || !quoted) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      // Verificar si es una imagen o un video
      const isImageMessage = isImage(quoted);
      const isVideoMessage = isVideo(quoted);

      if (!isImageMessage && !isVideoMessage) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      await sendReact("🤔", webMessage.key);

      // Descargar el archivo dependiendo de si es imagen o video
      const buffer = isImageMessage ? await downloadImage(quoted) : await downloadVideo(quoted);
      if (!buffer) {
        await sendReply("❌ No se pudo descargar el archivo. Intenta nuevamente.");
        return;
      }

      // Crear el sticker con la imagen o video
      const sticker = await createSticker(buffer, {
        type: isVideoMessage ? "full" : "image", // Ajuste para diferenciar video e imagen
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });

      // Enviar el sticker
      await sendMessage(webMessage.key.remoteJid, {
        sticker: sticker,
        quoted: webMessage,
      });

      await sendReact("🧩", webMessage.key);
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};