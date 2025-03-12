const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editar",
  description: "Edita la imagen con la posición de los objetos.",
  commands: ["editar"],
  usage: `${PREFIX}editar <posición>`,
  handle: async ({ socket, remoteJid, args }) => {
    const posicion = args[0]; // Obtiene la posición (A, B, C, etc.)
    const canvasWidth = 500;
    const canvasHeight = 600;

    // Crear un canvas en blanco
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Definir puntos clave de la cara humana
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const rX = 120; // Ancho de la cabeza
    const rY = 160; // Alto de la cabeza

    // Dibujar la forma de la cabeza (mandíbula, barbilla y frente)
    ctx.beginPath();
    ctx.moveTo(cx - rX * 0.6, cy + rY * 0.6); // Lado izquierdo de la mandíbula
    ctx.quadraticCurveTo(cx - rX, cy, cx - rX * 0.8, cy - rY * 0.5); // Curva de la mejilla izquierda
    ctx.quadraticCurveTo(cx, cy - rY, cx + rX * 0.8, cy - rY * 0.5); // Frente y parte superior
    ctx.quadraticCurveTo(cx + rX, cy, cx + rX * 0.6, cy + rY * 0.6); // Curva de la mejilla derecha
    ctx.quadraticCurveTo(cx, cy + rY * 1.1, cx - rX * 0.6, cy + rY * 0.6); // Barbilla
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujar orejas
    ctx.beginPath();
    ctx.ellipse(cx - rX, cy - 30, 25, 40, 0, 0, Math.PI * 2); // Oreja izquierda
    ctx.ellipse(cx + rX, cy - 30, 25, 40, 0, 0, Math.PI * 2); // Oreja derecha
    ctx.stroke();

    // Función para dibujar el círculo verde en la posición solicitada
    const dibujarCírculoVerde = (pos) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'green';
      ctx.fill();
    };

    // Mapa de las posiciones de los objetos
    const posiciones = {
      A: { x: cx, y: cy - rY + 20 }, // Parte superior de la cabeza
      B: { x: cx - 50, y: cy - 40 }, // Ojo izquierdo
      C: { x: cx + 50, y: cy - 40 }, // Ojo derecho
      D: { x: cx, y: cy + 10 }, // Nariz
      E: { x: cx, y: cy + 60 }, // Boca
      F: { x: cx - rX, y: cy - 30 }, // Oreja izquierda
      G: { x: cx + rX, y: cy - 30 }, // Oreja derecha
      H: { x: cx, y: cy + rY + 20 }, // Cuello
      I: { x: cx - rX + 30, y: cy - rY + 20 }, // Parte superior izquierda
      J: { x: cx + rX - 30, y: cy - rY + 20 }, // Parte superior derecha
    };

    // Verificar si la posición es válida
    if (!posiciones[posicion]) {
      socket.sendMessage(remoteJid, {
        text: "Comando no reconocido. Usa una posición válida (A, B, C, etc.).",
      });
      return;
    }

    // Dibujar el círculo verde en la posición solicitada
    dibujarCírculoVerde(posiciones[posicion]);

    // Guardar la imagen con el nombre correspondiente
    const outputPath = path.resolve(__dirname, `editar_${posicion}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al chat
    socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: `Imagen editada en la posición ${posicion}`,
    });
  },
};