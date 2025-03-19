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
    const ojosPath = path.resolve(__dirname, "../../../assets/images/ojos.png");
    const narutoPath = path.resolve(__dirname, "../../../assets/images/naruto.png");  // Ruta de Naruto

    // Cargar imágenes base
    const rostro = await loadImage(rostroPath);
    const canvas = createCanvas(rostro.width, rostro.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

    // Verificar qué objetos tiene colocados el usuario
    const objetoA1 = usuarios[remoteJid].objetos.find(o => o === "gafas" || o === "lentes");
    const objetoA = usuarios[remoteJid].objetos.find(o => o === "ojos" || o === "naruto");

    // Primero, dibujamos las gafas o lentes (A1) si existen
    if (objetoA1) {
      let objetoImagenA1 = objetoA1 === "gafas" ? await loadImage(gafasPath) : await loadImage(lentesPath);

      // Coordenadas y dimensiones para las gafas o lentes (A1)
      const posicionX = 174;
      const posicionY = 247;
      const ancho = 146;
      const alto = 53;

      ctx.drawImage(objetoImagenA1, posicionX, posicionY, ancho, alto);
    }

    // Luego, dibujamos los ojos o naruto (A), que pueden colocarse siempre, aunque sin A1
    if (objetoA) {
      let objetoImagenA = objetoA === "ojos" ? await loadImage(ojosPath) : await loadImage(narutoPath);

      // Coordenadas y dimensiones para los ojos o naruto (A), debajo de las gafas/lentes (si hay)
      const posicionX = 178; // Ajustar para que se alinee bien sobre la cara
      const posicionY = objetoA1 ? 310 : 250; // Si hay A1, debajo de este; si no, más arriba
      const ancho = 140;
      const alto = 40;

      ctx.drawImage(objetoImagenA, posicionX, posicionY, ancho, alto);
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

    console.log(`✅ [DEBUG] ${remoteJid} ha visto su personaje con:`, objetoA || objetoA1 ? objetoA : "ningún objeto");
  },
};