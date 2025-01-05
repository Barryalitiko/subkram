const { PREFIX } = require("../../krampus");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

module.exports = {
  name: "blanco-y-negro",
  description: "Convierte una imagen en blanco y negro.",
  commands: ["byn", "blanco-y-negro"],
  usage: `${PREFIX}blanco-y-negro`,
  cooldown: 10, // 10 segundos entre usos
  handle: async ({ isImage, isReply, sendReply, sendReact, webMessage, downloadImage, sendStickerFromFile }) => {
    console.log("[BLANCO-Y-NEGRO] Comando ejecutado.");

    try {
      if (!isImage && !isReply) {
        console.log("[BLANCO-Y-NEGRO] El comando no fue usado con una imagen.");
        await sendReply("Por favor, responde a una imagen con este comando.");
        await sendReact("⚠️");
        return;
      }

      await sendReact("⏳");
      console.log("[BLANCO-Y-NEGRO] Procesando imagen...");

      // Descargar la imagen
      const filePath = await downloadImage(webMessage, "original");
      console.log(`[BLANCO-Y-NEGRO] Imagen descargada en: ${filePath}`);

      const originalImage = await loadImage(filePath);
      console.log("[BLANCO-Y-NEGRO] Imagen cargada correctamente.");

      // Crear un canvas con las dimensiones de la imagen
      const canvas = createCanvas(originalImage.width, originalImage.height);
      const ctx = canvas.getContext("2d");

      // Dibujar la imagen en el canvas
      ctx.drawImage(originalImage, 0, 0);

      // Obtener los datos de los píxeles y convertirlos a blanco y negro
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      console.log("[BLANCO-Y-NEGRO] Procesando píxeles...");
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        // Convertir a escala de grises
        const grayscale = 0.3 * r + 0.59 * g + 0.11 * b;
        imageData.data[i] = grayscale;
        imageData.data[i + 1] = grayscale;
        imageData.data[i + 2] = grayscale;
      }

      // Colocar los datos convertidos de vuelta en el canvas
      ctx.putImageData(imageData, 0, 0);
      console.log("[BLANCO-Y-NEGRO] Conversión a blanco y negro completada.");

      // Guardar la imagen procesada en un archivo temporal
      const outputFilePath = filePath.replace("original", "processed");
      const out = fs.createWriteStream(outputFilePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        console.log(`[BLANCO-Y-NEGRO] Imagen procesada guardada en: ${outputFilePath}`);
        await sendReply("Aquí tienes tu imagen en blanco y negro:");
        await sendStickerFromFile(outputFilePath); // Enviar la imagen como respuesta
        console.log("[BLANCO-Y-NEGRO] Imagen enviada correctamente.");
        fs.unlinkSync(outputFilePath); // Eliminar archivo procesado
        console.log(`[BLANCO-Y-NEGRO] Archivo temporal eliminado: ${outputFilePath}`);
      });

      out.on("error", (err) => {
        console.error("[BLANCO-Y-NEGRO] Error al guardar la imagen procesada:", err);
      });
    } catch (error) {
      console.error("[BLANCO-Y-NEGRO] Error al procesar la imagen:", error);
      await sendReply("Hubo un error al procesar la imagen.");
      await sendReact("❌");
    }
  },
};