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
    isVideo
  }) => {
    try {
      if (!isReply || !quoted) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      // Detectamos si el mensaje es una imagen o un video usando las funciones isImage e isVideo
      if (!isImage(quoted) && !isVideo(quoted)) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      await sendReact("🤔", webMessage.key);

      const buffer = await quoted.download();
      if (!buffer) {
        await sendReply("❌ No se pudo descargar el archivo. Intenta nuevamente.");
        return;
      }

      const sticker = await createSticker(buffer, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });

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