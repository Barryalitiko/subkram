const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

let usuarios = {}; // Simulación de base de datos

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos comprados.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    // Crear la carpeta temp si no existe
    const tempDir = path.resolve(__dirname, "../../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Imagen base del rostro
    const rostroPath = path.resolve(__dirname, "../../../assets/images/cara.png");
    const gafasPath = path.resolve(__dirname, "../../../assets/images/gafas.png");
    const lentesPath = path.resolve(__dirname, "../../../assets/images/lentes.png");

    // Verificar si el usuario tiene objetos
    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    const tieneGafas = usuarios[remoteJid].objetos.includes("gafas");
    const tieneLentes = usuarios[remoteJid].objetos.includes("lentes");

    // Cargar imagen base
    const imagenBase = await loadImage(rostroPath);
    const canvas = createCanvas(imagenBase.width, imagenBase.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imagenBase, 0, 0, imagenBase.width, imagenBase.height);

    // Dibujar objeto si el usuario lo tiene
    if (tieneGafas) {
      const gafas = await loadImage(gafasPath);
      ctx.drawImage(gafas, 174, 247, 146, 53);
    } else if (tieneLentes) {
      const lentes = await loadImage(lentesPath);
      ctx.drawImage(lentes, 174, 247, 146, 53);
    }

    // Guardar imagen generada
    const outputPath = path.join(tempDir, `personaje_${remoteJid}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al chat
    await socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: "Aquí está tu personaje.",
    });
  },
};