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

    // Cargar imágenes base
    const rostro = await loadImage(rostroPath);
    const canvas = createCanvas(rostro.width, rostro.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

    // Verificar qué objeto tiene colocado
    let objetoActual = usuarios[remoteJid].objetos.find(o => o === "gafas" || o === "lentes" || o === "ojos");

    // Primero, dibujamos las gafas o lentes (A1)
    if (objetoActual === "gafas" || objetoActual === "lentes") {
      let objetoImagen = objetoActual === "gafas" ? await loadImage(gafasPath) : await loadImage(lentesPath);

      // Coordenadas y dimensiones para las gafas o lentes (A1)
      const posicionX = 174;
      const posicionY = 247;
      const ancho = 146;
      const alto = 53;

      ctx.drawImage(objetoImagen, posicionX, posicionY, ancho, alto);
    }

    // Después, dibujamos los ojos (A) debajo de las gafas o lentes
    if (usuarios[remoteJid].objetos.includes("ojos")) {
      let objetoImagen = await loadImage(ojosPath);

      // Coordenadas y dimensiones para los ojos (A)
      const posicionX = 170; // Ajustar para que se alinee bien sobre la cara
      const posicionY = 250; // Ajustar para que se alinee bien sobre la cara, debajo de las gafas/lentes
      const ancho = 140;
      const alto = 40;

      ctx.drawImage(objetoImagen, posicionX, posicionY, ancho, alto);
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

    console.log(`✅ [DEBUG] ${remoteJid} ha visto su personaje con:`, objetoActual || "ningún objeto");
  },
};