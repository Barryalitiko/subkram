const { PREFIX, TEMP_DIR } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const path = require("path");
const fs = require("fs");
const { Sticker } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  description: "Crea stickers de imagen/gif/vídeo",
  commands: ["s", "sticker"],
  usage: `${PREFIX}sticker (etiqueta imagen/gif/vídeo) o ${PREFIX}sticker (responde a imagen/gif/vídeo)`,
  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    webMessage,
    sendErrorReply,
    sendStickerFromFile,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        "umm... debes indicarme lo que quieras que te convierta a sticker\> Krampus OM bot"
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

      await sendStickerFromFile(outputPath);

      // Reacción con 🧩
      await webMessage.react("🧩");

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

        await sendErrorReply(`Umm... Este video tiene más de ${sizeInSeconds} segundos.\nEnvía un video más corto.`);
        return;
      }

      const videoBuffer = fs.readFileSync(inputPath);

      // Crear sticker desde video
      const sticker = new Sticker(videoBuffer, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus",
      });

      await sticker.toFile(outputPath);

      await sendStickerFromFile(outputPath);

      // Reacción con 🧩
      await webMessage.react("🧩");

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    }
  },
};