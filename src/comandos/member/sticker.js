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

      // Verificar si el mensaje es una imagen o un video usando las funciones isImage y isVideo
      const message = quoted.msg;

      if (isImage(message)) {
        await sendReact("🤔", webMessage.key);
        const buffer = await downloadImage(quoted);
        if (!buffer) {
          await sendReply("❌ No se pudo descargar la imagen. Intenta nuevamente.");
          return;
        }

        // Crear el sticker con la imagen
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

        await sendReact("🧩", webMessage.key);

      } else if (isVideo(message)) {
        await sendReact("🤔", webMessage.key);
        const buffer = await downloadVideo(quoted);
        if (!buffer) {
          await sendReply("❌ No se pudo descargar el video. Intenta nuevamente.");
          return;
        }

        // Crear el sticker con el video
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

        await sendReact("🧩", webMessage.key);

      } else {
        await sendReply("❌ Este mensaje no contiene una imagen ni un video.");
      }
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};