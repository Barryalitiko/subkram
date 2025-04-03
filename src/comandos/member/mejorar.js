const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "mejorar",
  description: "Mejora la calidad de una imagen aplicando nitidez y aumentando la resolución",
  commands: ["mejorar", "hd", "enhance"],
  usage: `${PREFIX}mejorar (responder a imagen)`,
  handle: async ({
    webMessage,
    isReply,
    isImage,
    downloadImage,
    sendImageFromFile,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
  }) => {
    if (!isReply || !isImage) {
      throw new WarningError("Debes responder a una imagen para mejorar su calidad.");
    }

    await sendWaitReact();

    try {
      const inputPath = await downloadImage(webMessage, "temp_image");
      const outputPath = path.join(__dirname, "temp_image_mejorada.png");

      await sharp(inputPath)
        .resize({ width: 1500 }) // Aumenta la resolución
        .sharpen() // Aplica nitidez
        .toFile(outputPath);

      await sendSuccessReact();
      await sendImageFromFile(outputPath, "Aquí tienes tu imagen mejorada.");

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error("Error al mejorar la imagen:", error);
      await sendErrorReply("Hubo un error al mejorar la imagen.");
    }
  },
};
