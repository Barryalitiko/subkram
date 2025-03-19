const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos colocados sobre los ojos.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    const filePath = path.resolve(__dirname, "../../usuarios.json");

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
    }

    let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    // Imagen base del rostro
    const rostroPath = path.resolve(__dirname, "../../../assets/images/cara.png");
    const ojosPath = path.resolve(__dirname, "../../../assets/images/ojos.png");

    const imagenBase = await loadImage(rostroPath);
    const ojosImagen = await loadImage(ojosPath);
    const canvasWidth = imagenBase.width;
    const canvasHeight = imagenBase.height;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    
    // Dibujar el rostro base
    ctx.drawImage(imagenBase, 0, 0, canvasWidth, canvasHeight);

    // Colocar objetos (como lentes y gafas)
    const objetos = usuarios[remoteJid].objetos;

    // Primero colocamos los lentes o gafas si están presentes
    for (let objeto of objetos) {
      if (objeto === "gafas" || objeto === "lentes") {
        let objetoPath = "";

        if (objeto === "gafas") {
          objetoPath = path.resolve(__dirname, "../../../assets/images/gafas.png");
        } else if (objeto === "lentes") {
          objetoPath = path.resolve(__dirname, "../../../assets/images/lentes.png");
        }

        const objetoImagen = await loadImage(objetoPath);
        ctx.drawImage(objetoImagen, 0, 0, canvasWidth, canvasHeight); // Ajusta la posición si es necesario
      }
    }

    // Colocar los ojos (si el objeto "ojos" está en la lista)
    if (objetos.includes("ojos")) {
      ctx.drawImage(ojosImagen, 0, 0, canvasWidth, canvasHeight); // Ajusta la posición si es necesario
    }

    const outputPath = path.resolve(__dirname, `personaje_${remoteJid}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al usuario
    await socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: `Aquí está tu personaje con los objetos puestos.`,
    });
  },
};