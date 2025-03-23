const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp"); // Librería para manejar conversiones de imagen

const filePath = path.resolve(__dirname, "../../usuarios.json");
const tempPath = path.resolve(__dirname, "../../temp");

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos comprados.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    try {
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

      // Rutas de objetos
      const objetosA = {
        ojos: path.resolve(__dirname, "../../../assets/images/ojos.png"),
        naruto: path.resolve(__dirname, "../../../assets/images/naruto.png"),
        sasuke: path.resolve(__dirname, "../../../assets/images/sasuke.png"),
        rinesharingan: path.resolve(__dirname, "../../../assets/images/rinesharingan.png"),
        rinegan: path.resolve(__dirname, "../../../assets/images/rinegan.png"),
        remolino: path.resolve(__dirname, "../../../assets/images/remolino.png"),
      };

      const objetosB = {
        labios: path.resolve(__dirname, "../../../assets/images/labios.png"),
        bocamorada: path.resolve(__dirname, "../../../assets/images/bocamorada.png"),
        bocaroja: path.resolve(__dirname, "../../../assets/images/bocaroja.png"),
        bocaalegre: path.resolve(__dirname, "../../../assets/images/bocaalegre.png"),
        labiosnormales: path.resolve(__dirname, "../../../assets/images/labiosnormales.png"),
      };

      // Crear la imagen con los objetos colocados
      const rostro = await loadImage(rostroPath);
      const canvas = createCanvas(rostro.width, rostro.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

      const objetoA = usuarios[remoteJid].objetos.find(obj => objetosA[obj]);
      if (objetoA) {
        const objetoImagen = await loadImage(objetosA[objetoA]);
        ctx.drawImage(objetoImagen, 178, 250, 140, 40);
      }

      if (usuarios[remoteJid].objetos.includes("gafas") || usuarios[remoteJid].objetos.includes("lentes")) {
        let objetoImagen = usuarios[remoteJid].objetos.includes("gafas") ? await loadImage(gafasPath) : await loadImage(lentesPath);
        ctx.drawImage(objetoImagen, 174, 247, 146, 53);
      }

      const objetoB = usuarios[remoteJid].objetos.find(obj => objetosB[obj]);
      if (objetoB) {
        const bocaImagen = await loadImage(objetosB[objetoB]);
        ctx.drawImage(bocaImagen, 211, 338, 72, (bocaImagen.height * (72 / bocaImagen.width)));
      }

      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      // Guardar la imagen temporal en PNG
      const pngPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
      const bufferPng = canvas.toBuffer("image/png");

      if (!bufferPng || bufferPng.length === 0) {
        throw new Error("Error al generar la imagen en formato PNG.");
      }

      fs.writeFileSync(pngPath, bufferPng);

      // Convertir la imagen PNG a WEBP para sticker con sharp
      const webpPath = path.resolve(tempPath, `personaje_${remoteJid}.webp`);
      await sharp(pngPath).toFormat("webp").toFile(webpPath);

      // Verificar que el archivo se creó correctamente
      if (!fs.existsSync(webpPath)) {
        throw new Error("Error al convertir la imagen a WebP.");
      }

      // Enviar la imagen como sticker
      await socket.sendMessage(remoteJid, {
        sticker: fs.readFileSync(webpPath),
        mimetype: "image/webp",
      });

      console.log(`✅ [DEBUG] ${remoteJid} ha visto su personaje con:`, usuarios[remoteJid].objetos);
    } catch (error) {
      console.error("❌ Error al generar sticker:", error);
      await socket.sendMessage(remoteJid, {
        text: `☠ Ocurrió un error al generar tu sticker.\n📄 *Detalles*: ${error.message}`,
      });
    }
  },
};
