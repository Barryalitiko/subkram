const { PREFIX } = require("../../krampus");
const { Sticker, createSticker } = require("wa-sticker-formatter");
const fs = require("fs");
const path = require("path");

const TEMP_FOLDER = path.join(__dirname, "../../temp");

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

      const isImageMessage = isImage(quoted);
      const isVideoMessage = isVideo(quoted);

      if (!isImageMessage && !isVideoMessage) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      await sendReact("🤔", webMessage.key);

      let buffer;
      let filePath;

      if (isImageMessage) {
        buffer = await downloadImage(quoted, "input");
        filePath = path.join(TEMP_FOLDER, "image.png");
        fs.writeFileSync(filePath, buffer);
      } else if (isVideoMessage) {
        buffer = await downloadVideo(quoted, "input");
        filePath = path.join(TEMP_FOLDER, "video.mp4");
        fs.writeFileSync(filePath, buffer);
      }

      if (!buffer) {
        await sendReply("❌ No se pudo descargar el archivo. Intenta nuevamente.");
        return;
      }

      const sticker = await createSticker(filePath, {
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

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};
