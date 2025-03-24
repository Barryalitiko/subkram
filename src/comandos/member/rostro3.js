const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");
const { exec } = require("child_process");

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

      const rostroPath = path.resolve(__dirname, "../../../assets/images/cara.png");
      const tortugaPath = path.resolve(__dirname, "../../../assets/images/tortuga.gif");
      const lovePath = path.resolve(__dirname, "../../../assets/images/love.gif");

      const rostro = await loadImage(rostroPath);
      const canvas = createCanvas(rostro.width, rostro.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      const pngPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
      const bufferPng = canvas.toBuffer("image/png");
      fs.writeFileSync(pngPath, bufferPng);

      const webpPath = path.resolve(tempPath, `personaje_${remoteJid}.webp`);
      let ffmpegCommand = `ffmpeg -i "${pngPath}"`;

      const tieneTortuga = usuarios[remoteJid].objetos.includes("tortuga");
      const tieneLove = usuarios[remoteJid].objetos.includes("love");

      if (tieneTortuga && tieneLove) {
        await socket.sendMessage(remoteJid, { text: "No puedes tener ambos objetos al mismo tiempo." });
        return;
      }

      if (tieneTortuga) {
        ffmpegCommand += ` -i "${tortugaPath}" -filter_complex "[1:v]scale=75:144[tortuga];[0:v][tortuga]overlay=141:138"`;
      }
      
      if (tieneLove) {
        ffmpegCommand += ` -i "${lovePath}" -filter_complex "
          [1:v] scale=200:200, format=rgba [love];
          [0:v][love] overlay=x=200:y='150+20*sin(2*PI*t/3)':shortest=1
        "`;
      }

      ffmpegCommand += ` -loop 0 -y "${webpPath}"`;

      exec(ffmpegCommand, async (error) => {
        if (error) {
          console.error("❌ Error al generar el sticker animado:", error);
          return await socket.sendMessage(remoteJid, { text: `☠ Error al generar sticker: ${error.message}` });
        }
        await socket.sendMessage(remoteJid, { sticker: fs.readFileSync(webpPath), mimetype: "image/webp" });
      });

      console.log(`✅ [DEBUG] ${remoteJid} ha visto su personaje con:`, usuarios[remoteJid].objetos);
    } catch (error) {
      console.error("❌ Error al generar sticker:", error);
      await socket.sendMessage(remoteJid, { text: `☠ Ocurrió un error al generar tu sticker.\n📄 *Detalles*: ${error.message}` });
    }
  },
};
