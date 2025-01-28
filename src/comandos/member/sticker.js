const { PREFIX, TEMP_DIR } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const path = require("path");
const fs = require("fs");
const { Sticker } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  description: "Crea stickers de imagen/gif/vídeo",
  commands: ["s", "sticker", "fig", "f"],
  usage: `${PREFIX}sticker (etiqueta imagen/gif/vídeo) o ${PREFIX}sticker (responde a imagen/gif/vídeo)`,
  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    webMessage,
    sendErrorReply,
    sendSuccessReact,
    sendStickerFromBuffer,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        "👻 Krampus 👻 Debes marcar imagen/gif/vídeo o responder a una imagen/gif/vídeo"
      );
    }

    if (isImage) {
      const inputPath = await downloadImage(webMessage, "input");
      const imageBuffer = fs.readFileSync(inputPath);

      const sticker = new Sticker(imageBuffer, {
        type: "full",
        pack: "Krampus Stickers", // Nombre del pack
        author: "Krampus", // Autor
        categories: ["👻"], // Emoji o categoría opcional
      });

      const stickerBuffer = await sticker.toBuffer();
      await sendSuccessReact();
      await sendStickerFromBuffer(stickerBuffer);

      fs.unlinkSync(inputPath);
    } else {
      const inputPath = await downloadVideo(webMessage, "input");

      const sizeInSeconds = 10;

      const seconds =
        webMessage.message?.videoMessage?.seconds ||
        webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.videoMessage?.seconds;

      const haveSecondsRule = seconds <= sizeInSeconds;

      if (!haveSecondsRule) {
        fs.unlinkSync(inputPath);

        await sendErrorReply(`👻 Krampus 👻 Este video tiene más de ${sizeInSeconds} segundos.

Envía un video más corto.`);
        return;
      }

      const videoBuffer = fs.readFileSync(inputPath);

      const sticker = new Sticker(videoBuffer, {
        type: "full",
        pack: "Krampus Stickers",
        author: "Krampus",
        categories: ["👻"],
      });

      const stickerBuffer = await sticker.toBuffer();
      await sendSuccessReact();
      await sendStickerFromBuffer(stickerBuffer);

      fs.unlinkSync(inputPath);
    }
  },
};