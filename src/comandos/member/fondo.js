const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "quitarfondo",
  description: "Quita el fondo de una imagen (solo color sólido)",
  commands: ["quitarfondo", "removebg"],
  usage: `${PREFIX}quitarfondo (responder a imagen)`,
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
      throw new WarningError("Debes responder a una imagen para quitar el fondo.");
    }

    await sendWaitReact();

    try {
      // Descarga la imagen
      const imagePath = await downloadImage(webMessage, "image_to_remove_bg");

      // Carga la imagen en un canvas
      const image = await loadImage(imagePath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      // Dibuja la imagen en el canvas
      ctx.drawImage(image, 0, 0);

      // Obtén los datos de la imagen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Asume que el fondo es un color sólido (por ejemplo, blanco)
      const bgColor = { r: 255, g: 255, b: 255 }; // Color blanco

      // Elimina el fondo (blanco)
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === bgColor.r && data[i + 1] === bgColor.g && data[i + 2] === bgColor.b) {
          data[i + 3] = 0; // Hace el fondo transparente
        }
      }

      // Actualiza la imagen
      ctx.putImageData(imageData, 0, 0);

      // Guarda la imagen modificada en el sistema de archivos
      const outputPath = path.join(__dirname, "image_no_bg.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        await sendSuccessReact();
        await sendImageFromFile(outputPath, "Aquí tienes tu imagen sin fondo.");
        fs.unlinkSync(imagePath);
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error("Error al quitar el fondo:", error);
      await sendErrorReply("Hubo un error al procesar la imagen.");
    }
  },
};
