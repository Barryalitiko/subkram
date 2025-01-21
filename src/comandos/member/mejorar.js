const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "improve",
  description: "Mejorar la calidad de una imagen",
  commands: ["improve", "enhance"],
  usage: `${PREFIX}mejorar <imagen>`,
  handle: async ({ socket, remoteJid, sendReply, args }) => {
    try {
      const imageUrl = args[0];
      if (!imageUrl) {
        return await sendReply("❌ Por favor, proporciona una imagen válida.");
      }

      // Descargar la imagen de la URL proporcionada
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();
      
      // Establecer el nombre del archivo de salida
      const outputFilePath = path.join(__dirname, 'assets', 'enhanced-image.jpg');

      // Usar sharp para mejorar la imagen
      await sharp(buffer)
        .resize({ width: 1920, height: 1080, fit: sharp.fit.inside }) // Aumentar resolución
        .sharpen() // Aumentar la nitidez
        .normalize() // Mejorar los colores y el contraste
        .toFile(outputFilePath);

      // Enviar la imagen mejorada al usuario
      await socket.sendMessage(remoteJid, {
        image: { url: outputFilePath },
        caption: "🎨 Aquí está tu imagen mejorada.",
      });

      // Eliminar el archivo después de un tiempo
      setTimeout(() => {
        fs.unlink(outputFilePath, (err) => {
          if (err) console.error("Error al eliminar la imagen:", err);
        });
      }, 5000); // Eliminar después de 5 segundos

    } catch (error) {
      console.error("Error al mejorar la imagen:", error);
      await sendReply("❌ Hubo un error al procesar tu solicitud.");
    }
  },
};