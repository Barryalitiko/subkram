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
    sendStickerFromFile,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        "👻 Krampus 👻 Debes marcar imagen/gif/vídeo o responder a una imagen/gif/vídeo"
      );
    }

    const outputPath = path.resolve(TEMP_DIR, "output.webp");

    if (isImage) {
      const inputPath = await downloadImage(webMessage, "input");
      const imageBuffer = fs.readFileSync(inputPath);

      // Crear sticker desde imagen
      const sticker = new Sticker(imageBuffer, {
        type: "full",
        pack: "Operacion Marshall", // Nombre del pack
        author: "Krampus OM bot", // Autor del sticker
      });

      await sticker.toFile(outputPath);

      await sendSuccessReact();
      await sendStickerFromFile(outputPath);

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
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

      // Crear sticker desde video
      const sticker = new Sticker(videoBuffer, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM bot",
      });

      await sticker.toFile(outputPath);

      await sendSuccessReact();
      await sendStickerFromFile(outputPath);

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    }
  },
};