const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

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
      const objetosA = {
        ojos: path.resolve(__dirname, "../../../assets/images/ojos.png"),
      };

      // Crear la imagen con los objetos colocados
      const rostro = await loadImage(rostroPath);
      const canvas = createCanvas(rostro.width, rostro.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

      // Dibujar objeto si el usuario tiene uno asignado
      const objetoA = usuarios[remoteJid].objetos.find(obj => objetosA[obj]);
      if (objetoA) {
        const objetoImagen = await loadImage(objetosA[objetoA]);
        ctx.drawImage(objetoImagen, 178, 250, 140, 40);
      }

      // Asegurar que la carpeta temporal existe
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      // Guardar la imagen como PNG
      const pngPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
      const bufferPng = canvas.toBuffer("image/png");

      if (!bufferPng || bufferPng.length === 0) {
        throw new Error("Error al generar la imagen en formato PNG.");
      }

      fs.writeFileSync(pngPath, bufferPng);

      // Convertir la imagen a WebP
      const webpPath = path.resolve(tempPath, `personaje_${remoteJid}.webp`);
      await sharp(pngPath).toFormat("webp").toFile(webpPath);

      const stickerPath = path.resolve(tempPath, `personaje_sticker_${remoteJid}.webp`);

      // Función para agregar nombre y paquete al sticker
      async function addExif() {
        const webpBuffer = fs.readFileSync(webpPath);

        const exifData = Buffer.from([
          0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x0C, 0x00, 0x0E, 0x01,
          0x02, 0x00, 0x20, 0x00, 0x00, 0x00, 0x68, 0x00, 0x00, 0x00,
          ...Buffer.from("MiPersonaje\0StickerPack\0", "utf-8"), // Cambia esto al nombre que desees
        ]);

        const stickerBuffer = Buffer.concat([
          Buffer.from("RIFF"),
          Buffer.from((webpBuffer.length + exifData.length + 4).toString(16), "hex"),
          Buffer.from("WEBPVP8X"),
          webpBuffer.slice(8, webpBuffer.length),
          Buffer.from("EXIF"),
          Buffer.from(exifData.length.toString(16), "hex"),
          exifData,
        ]);

        fs.writeFileSync(stickerPath, stickerBuffer);
      }

      await addExif();

      // Enviar el sticker con nombre y paquete personalizados
      await socket.sendMessage(remoteJid, {
        sticker: fs.readFileSync(stickerPath),
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
