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
    const canvasWidth = 500; // Ajustar al tamaño real de la imagen si es diferente
    const canvasHeight = 600;

    // Ruta de la imagen del modelo
    const imagePath = path.resolve(__dirname, "../../../assets/images/cara.png");

    // Crear un canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Cargar la imagen del modelo
    const imagen = await loadImage(imagePath);
    ctx.drawImage(imagen, 0, 0, canvasWidth, canvasHeight);

    // Dibujar el rectángulo rojo en la posición de los ojos
    const rectX = 174, rectY = 247, rectWidth = 146, rectHeight = 53;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

    // Guardar la imagen con la edición
    const outputPath = path.resolve(__dirname, "editarA.png");
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al chat
    socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: "Marcador Tipo A (posición de los ojos).",
    });
  },
};