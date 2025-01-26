const { PREFIX, TEMP_DIR } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const { downloadMediaMessage, getContentType } = require("@whiskeysockets/baileys");

module.exports = {
  name: "sticker",
  description: "Faço figurinhas de imagem/gif/vídeo",
  commands: ["s", "sticker", "fig", "f"],
  usage: `${PREFIX}sticker (etiqueta imagen/gif/vídeo) o ${PREFIX}sticker (responde a imagen/gif/vídeo)`,

  handle: async ({
    webMessage,
    socket,
    sendErrorReply,
    sendSuccessReact,
    sendStickerFromFile,
  }) => {
    const messageType = getContentType(webMessage); // Detecta el tipo de mensaje (texto, imagen, video...)

    let buffer;
    let inputPath;
    const outputPath = path.resolve(TEMP_DIR, "output.webp");

    if (messageType === "imageMessage") {
      // Descargar la imagen
      const stream = await downloadMediaMessage(webMessage, "stream");
      inputPath = path.join(TEMP_DIR, "input.jpg");
      const writeStream = fs.createWriteStream(inputPath);
      stream.pipe(writeStream);

      writeStream.on('finish', async () => {
        // Convertir a sticker
        exec(`ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`, async (error) => {
          if (error) {
            console.log(error);
            fs.unlinkSync(inputPath);
            throw new Error(error);
          }

          await sendSuccessReact();
          await sendStickerFromFile(outputPath);

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        });
      });

    } else if (messageType === "videoMessage") {
      // Descargar el video
      const stream = await downloadMediaMessage(webMessage, "stream");
      inputPath = path.join(TEMP_DIR, "input.mp4");
      const writeStream = fs.createWriteStream(inputPath);
      stream.pipe(writeStream);

      writeStream.on('finish', async () => {
        const sizeInSeconds = 10;
        const seconds = webMessage.message?.videoMessage?.seconds || 0;

        if (seconds > sizeInSeconds) {
          fs.unlinkSync(inputPath);
          await sendErrorReply(`👻 Krampus 👻 Este video tiene más de ${sizeInSeconds} segundos. ¡Envía un video más corto!`);
          return;
        }

        exec(`ffmpeg -i ${inputPath} -y -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512,fps=12,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse" -f webp ${outputPath}`, async (error) => {
          if (error) {
            console.log(error);
            fs.unlinkSync(inputPath);
            throw new Error(error);
          }

          await sendSuccessReact();
          await sendStickerFromFile(outputPath);

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        });
      });
    } else {
      throw new InvalidParameterError("👻 Krampus 👻 Debes marcar imagen/gif/vídeo o responder a una imagen/gif/vídeo");
    }
  },
};