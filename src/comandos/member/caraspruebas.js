const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editar",
  description: "Marca una posición específica en la imagen.",
  commands: ["editar"],
  usage: `${PREFIX}editar <posición>`,
  handle: async ({ socket, remoteJid, args }) => {
    const posicion = args[0]?.toUpperCase(); // "A", "B", "C", etc.

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

    // Definir las posiciones de los rectángulos
    const posiciones = {
      A: { x: 174, y: 247, width: 146, height: 53 }, // Ojos
      B: { x: 207, y: 335, width: 84, height: 32 },  // Boca
      C: { x: 148, y: 120, width: 198, height: 111 }, // Cabeza
    };

    // Verificar si la posición es válida
    if (!posiciones[posicion]) {
      socket.sendMessage(remoteJid, {
        text: "Posición no válida. Usa A (ojos), B (boca) o C (cabeza).",
      });
      return;
    }

    // Dibujar el rectángulo rojo en la posición seleccionada
    const { x, y, width, height } = posiciones[posicion];
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Guardar la imagen editada
    const outputPath = path.resolve(__dirname, `editar_${posicion}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al chat sin deformaciones
    socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: `Marcador Tipo ${posicion} (${posicion === "A" ? "ojos" : posicion === "B" ? "boca" : "cabeza"}).`,
    });
  },
};