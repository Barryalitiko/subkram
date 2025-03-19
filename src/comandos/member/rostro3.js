const { PREFIX } = require("../../krampus");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

let usuarios = {}; // Base de datos temporal

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos colocados.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetoA1: null }; 
    }

    // Cargar la imagen base del rostro
    const imagenBase = await loadImage(path.resolve(__dirname, "../../../assets/images/cara.png"));
    const canvas = createCanvas(imagenBase.width, imagenBase.height);
    const ctx = canvas.getContext("2d");

    // Dibujar la imagen base
    ctx.drawImage(imagenBase, 0, 0, imagenBase.width, imagenBase.height);

    // Agregar objeto A1 (si tiene)
    if (usuarios[remoteJid].objetoA1) {
      const objetoPath = path.resolve(__dirname, `../../../assets/images/${usuarios[remoteJid].objetoA1}.png`);
      if (fs.existsSync(objetoPath)) {
        const objeto = await loadImage(objetoPath);
        ctx.drawImage(objeto, 174, 247, 146, 53); // Posición y tamaño de los objetos A1
      }
    }

    // Guardar la imagen generada
    const outputPath = path.resolve(__dirname, `../../../temp/personaje_${remoteJid}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al usuario
    await socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: "Aquí está tu personaje.",
    });
  },
};