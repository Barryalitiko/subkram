const { PREFIX, TEMP_DIR } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

module.exports = {
  name: "sticker",
  description: "Crear stickers a partir de imágenes o videos.",
  commands: ["sticker", "stickerimage"],
  usage: `${PREFIX}sticker <imagen/gif/video> o responde a un mensaje con imagen/gif/video`,
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
    try {
      // Verificar si es una imagen o video
      if (!isImage && !isVideo) {
        throw new InvalidParameterError(
          "👻 Krampus 👻 Debes proporcionar una imagen, gif o video o responder a una imagen/gif/video."
        );
      }

      const outputPath = path.resolve(TEMP_DIR, "output.webp");

      if (isImage) {
        const inputPath = await downloadImage(webMessage, "input");

        exec(
          `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`,
          async (error) => {
            if (error) {
              console.log(error);
              fs.unlinkSync(inputPath);
              throw new Error("Error al crear el sticker.");
            }

            await sendSuccessReact();
            await sendStickerFromFile(outputPath);
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
          }
        );
      } else if (isVideo) {
        const inputPath = await downloadVideo(webMessage, "input");

        const sizeInSeconds = 10; // Limite de duración para el video

        const seconds =
          webMessage.message?.videoMessage?.seconds ||
          webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
            ?.videoMessage?.seconds;

        const haveSecondsRule = seconds <= sizeInSeconds;

        if (!haveSecondsRule) {
          fs.unlinkSync(inputPath);
          await sendErrorReply(
            `👻 Krampus 👻 El video tiene más de ${sizeInSeconds} segundos. ¡Envía un video más corto!`
          );
          return;
        }

        exec(
          `ffmpeg -i ${inputPath} -y -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512,fps=12,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse" -f webp ${outputPath}`,
          async (error) => {
            if (error) {
              console.log(error);
              fs.unlinkSync(inputPath);
              throw new Error("Error al crear el sticker.");
            }

            await sendSuccessReact();
            await sendStickerFromFile(outputPath);
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
          }
        );
      }
    } catch (error) {
      console.error("Error en el comando de sticker:", error);
      await sendErrorReply(`❌ Error: ${error.message}`);
    }
  },
};