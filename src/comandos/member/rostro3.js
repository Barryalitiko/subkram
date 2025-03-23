const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

const filePath = path.resolve(__dirname, "../../usuarios.json");
const tempPath = path.resolve(__dirname, "../../temp");
const gifPath = path.resolve(__dirname, "../../../assets/images/tortuga.webp"); // Ruta del GIF

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

      const rostroPath = path.resolve(__dirname, "../../../assets/images/cara.png");
      const rostro = await loadImage(rostroPath);
      const canvas = createCanvas(rostro.width, rostro.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      // Guardar imagen base en PNG
      const pngPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
      fs.writeFileSync(pngPath, canvas.toBuffer("image/png"));

      // Agregar GIF animado
      const finalWebpPath = path.resolve(tempPath, `personaje_${remoteJid}.webp`);
      await sharp(pngPath)
        .composite([{ input: gifPath, top: 162, left: 153 }])
        .toFormat("webp")
        .toFile(finalWebpPath);

      if (!fs.existsSync(finalWebpPath)) {
        throw new Error("Error al generar el sticker animado.");
      }

      await socket.sendMessage(remoteJid, {
        sticker: fs.readFileSync(finalWebpPath),
        mimetype: "image/webp",
      });

      console.log(`✅ [DEBUG] ${remoteJid} ha visto su personaje con animación.`);
    } catch (error) {
      console.error("❌ Error al generar sticker:", error);
      await socket.sendMessage(remoteJid, {
        text: `☠ Ocurrió un error al generar tu sticker.
📄 *Detalles*: ${error.message}`,
      });
    }
  },
};
