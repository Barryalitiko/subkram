const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editar",
  description: "Edita la imagen con la posición de los objetos.",
  commands: ["editar"],
  usage: `${PREFIX}editar <posicion>`,
  handle: async ({ socket, remoteJid, args }) => {
    const posicion = args[0]; // Obtiene la posición (A, B, C, etc.)
    const canvasWidth = 500;
    const canvasHeight = 500;

    // Crear un canvas en blanco
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Definir círculo azul (representando la cabeza)
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const r = 100;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Función para dibujar el círculo verde en la posición solicitada
    const dibujarCírculoVerde = (pos) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r / 10, 0, Math.PI * 2);
      ctx.fillStyle = 'green';
      ctx.fill();
    };

    // Mapa de las posiciones de los objetos
    const posiciones = {
      A: { x: cx, y: cy },  // Cabeza (centro)
      B: { x: cx - r / 3, y: cy - r / 3 },  // Ojo izquierdo
      C: { x: cx + r / 3, y: cy - r / 3 },  // Ojo derecho
      D: { x: cx, y: cy + r / 3 },  // Nariz
      E: { x: cx, y: cy + r / 2 },  // Boca
      F: { x: cx - r, y: cy },  // Oído izquierdo
      G: { x: cx + r, y: cy },  // Oído derecho
      H: { x: cx, y: cy + r + 30 },  // Cuello
      I: { x: cx - r, y: cy - r },  // Parte superior izquierda
      J: { x: cx + r, y: cy - r },  // Parte superior derecha
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