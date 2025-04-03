const { PREFIX } = require("../../krampus");
const { remove } = require("rembg-node");
const fs = require("fs");
const path = require("path");
const { WarningError } = require("../../errors/WarningError");

module.exports = {
  name: "quitarfondo",
  description: "Elimina el fondo de una imagen",
  commands: ["quitarfondo", "removebg", "nofondo"],
  usage: `${PREFIX}quitarfondo (responde a una imagen)`,
  handle: async ({ message, sendWaitReact, sendSuccessReact, sendImage }) => {
    if (!message || !message.quoted || !message.quoted.hasMedia) {
      throw new WarningError("Por favor, responde a una imagen para quitarle el fondo.");
    }

    await sendWaitReact();

    try {
      const media = await message.quoted.downloadMedia();
      const inputPath = path.join(__dirname, "input.png");
      const outputPath = path.join(__dirname, "output.png");

      fs.writeFileSync(inputPath, media.data, "base64");

      const buffer = await remove(fs.readFileSync(inputPath));
      fs.writeFileSync(outputPath, buffer);

      await sendSuccessReact();
      await sendImage(outputPath);

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error("Error al quitar el fondo:", error);
      throw new WarningError("Hubo un problema al procesar la imagen. Intenta de nuevo.");
    }
  },
};
