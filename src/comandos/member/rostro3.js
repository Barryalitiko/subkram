const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const filePath = path.resolve(__dirname, "../../usuarios.json");
const tempPath = path.resolve(__dirname, "../../temp");

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos comprados.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    // Verificar si el archivo de usuarios existe
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
    }

    let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
      fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");
    }

    // Rutas de imágenes base
    const rostroPath = path.resolve(__dirname, "../../../assets/images/cara.png");
    const gafasPath = path.resolve(__dirname, "../../../assets/images/gafas.png");
    const lentesPath = path.resolve(__dirname, "../../../assets/images/lentes.png");
    const bocaPath = path.resolve(__dirname, "../../../assets/images/boca.png"); // Nueva boca

    // Rutas de los objetos del grupo A (ojos)
    const objetosA = {
      ojos: path.resolve(__dirname, "../../../assets/images/ojos.png"),
      naruto: path.resolve(__dirname, "../../../assets/images/naruto.png"),
      sasuke: path.resolve(__dirname, "../../../assets/images/sasuke.png"),
      rinesharingan: path.resolve(__dirname, "../../../assets/images/rinesharingan.png"),
      rinegan: path.resolve(__dirname, "../../../assets/images/rinegan.png"),
      remolino: path.resolve(__dirname, "../../../assets/images/remolino.png"),
    };

    // Cargar la imagen base del rostro
    const rostro = await loadImage(rostroPath);
    const canvas = createCanvas(rostro.width, rostro.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

    // Dibujar el objeto del grupo A (ojos)
    const objetoA = usuarios[remoteJid].objetos.find(obj => objetosA[obj]);
    if (objetoA) {
      const objetoImagen = await loadImage(objetosA[objetoA]);

      // Coordenadas y dimensiones para los objetos A (ojos)
      const posicionX = 178;
      const posicionY = 250;
      const ancho = 140;
      const alto = 40;

      ctx.drawImage(objetoImagen, posicionX, posicionY, ancho, alto);
    }

    // Dibujar los objetos A1 (gafas o lentes)
    if (usuarios[remoteJid].objetos.includes("gafas") || usuarios[remoteJid].objetos.includes("lentes")) {
      let objetoImagen = usuarios[remoteJid].objetos.includes("gafas") ? await loadImage(gafasPath) : await loadImage(lentesPath);

      // Coordenadas y dimensiones para las gafas o lentes (A1)
      const posicionX = 174;
      const posicionY = 247;
      const ancho = 146;
      const alto = 53;

      ctx.drawImage(objetoImagen, posicionX, posicionY, ancho, alto);
    }

    // Dibujar la boca si el usuario la tiene en su inventario (Grupo B)
    if (usuarios[remoteJid].objetos.includes("boca")) {
      const bocaImagen = await loadImage(bocaPath);

      // **Coordenadas y dimensiones para la boca**
      const posicionX = 211; // Lado izquierdo del área definida
      const posicionY = 338; // Posición superior del área definida
      const ancho = 72; // Flexible (dependerá del PNG)
      const alto = 31; // Altura fija hasta la línea superior de la boca

      ctx.drawImage(bocaImagen, posicionX, posicionY, ancho, alto);
    }

    // Asegurar que la carpeta temporal exista
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    // Guardar la imagen generada
    const outputPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al usuario
    await socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: "Aquí está tu personaje.",
    });

    console.log(`✅ [DEBUG] ${remoteJid} ha visto su personaje con:`, usuarios[remoteJid].objetos);
  },
};