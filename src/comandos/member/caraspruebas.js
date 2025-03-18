const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editarA",
  description: "Marca la posición de los ojos (Tipo A).",
  commands: ["editarA"],
  usage: `${PREFIX}editarA`,
  handle: async ({ socket, remoteJid }) => {
    // Ruta de la imagen original
    const imagePath = path.resolve(__dirname, "../../../assets/images/cara.png");

    // Cargar la imagen para obtener sus dimensiones reales
    const imagen = await loadImage(imagePath);
    const canvasWidth = imagen.width;
    const canvasHeight = imagen.height;

    // Crear un canvas con las dimensiones exactas de la imagen
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Dibujar la imagen original en el canvas sin alterarla
    ctx.drawImage(imagen, 0, 0, canvasWidth, canvasHeight);

    // Dibujar el rectángulo rojo en la posición exacta de los ojos
    const rectX = 174;
    const rectY = 247;
    const rectWidth = 146;
    const rectHeight = 53;

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

    // Guardar la imagen editada
    const outputPath = path.resolve(__dirname, "editarA.png");
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al chat sin deformaciones
    socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: "Marcador Tipo A (posición de los ojos).",
    });
  },
};