const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editar",
  description: "Añade un objeto en la posición especificada en la imagen.",
  commands: ["editar"],
  usage: `${PREFIX}editar <posición>`,
  handle: async ({ socket, remoteJid, args }) => {
    const posicion = args[0]?.toUpperCase(); // "A", "B", etc.

    // Rutas de imágenes
    const imagePath = path.resolve(__dirname, "../../../assets/images/cara.png");
    const objetoPath = path.resolve(__dirname, "../../../assets/images/gafas.png"); // PNG del objeto

    // Cargar imágenes
    const imagenBase = await loadImage(imagePath);
    const objeto = await loadImage(objetoPath);
    const canvasWidth = imagenBase.width;
    const canvasHeight = imagenBase.height;

    // Crear canvas con la imagen base
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imagenBase, 0, 0, canvasWidth, canvasHeight);

    // Definir posiciones
    const posiciones = {
      A: { x: 174, y: 247, width: 146, height: 53 }, // Ojos
    };

    if (!posiciones[posicion]) {
      socket.sendMessage(remoteJid, {
        text: "Posición no válida. Usa A (ojos).",
      });
      return;
    }

    // Obtener coordenadas de la posición seleccionada
    const { x, y, width, height } = posiciones[posicion];

    // Calcular escalado proporcional del objeto PNG
    const aspectRatio = objeto.width / objeto.height;
    let newWidth = width;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > height) {
      newHeight = height;
      newWidth = newHeight * aspectRatio;
    }

    // Centrar el objeto en la posición
    const objX = x + (width - newWidth) / 2;
    const objY = y + (height - newHeight) / 2;

    // Dibujar el objeto en la posición
    ctx.drawImage(objeto, objX, objY, newWidth, newHeight);

    // Guardar imagen editada
    const outputPath = path.resolve(__dirname, `editar_${posicion}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al chat
    socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: `Objeto añadido en Tipo ${posicion} (ojos).`,
    });
  },
};