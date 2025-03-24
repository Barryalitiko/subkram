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
      const lovePath = path.resolve(__dirname, "../../../assets/images/love.gif");
      const tortugaPath = path.resolve(__dirname, "../../../assets/images/tortuga.gif");

      const rostro = await loadImage(rostroPath);
      const canvas = createCanvas(rostro.width, rostro.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);
      
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }
      const pngPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
      fs.writeFileSync(pngPath, canvas.toBuffer("image/png"));
      const webpPath = path.resolve(tempPath, `personaje_${remoteJid}.webp`);
      
      let ffmpegCommand = `ffmpeg -i "${pngPath}"`;
      let filters = [];
      let inputs = 1;
      
      if (usuarios[remoteJid].objetos.includes("tortuga")) {
        ffmpegCommand += ` -i "${tortugaPath}"`;
        filters.push(`[${inputs}:v]scale=75:144[tortuga];[0:v][tortuga]overlay=141:138`);
        inputs++;
      }
      
      if (usuarios[remoteJid].objetos.includes("love")) {
        ffmpegCommand += ` -i "${lovePath}"`;
        filters.push(`
          [${inputs}:v]scale=200:200, 
          format=rgba,
          rotate='2*PI*t/5:c=black@0' [love];
          [0:v][love] overlay=x='200+100*sin(2*PI*t/5)':y='150+50*cos(2*PI*t/5)'`);
        inputs++;
      }
      
      if (filters.length > 0) {
        ffmpegCommand += ` -filter_complex "${filters.join(';')}"`;
      }
      
      ffmpegCommand += ` -loop 0 -y "${webpPath}"`;
      
      exec(ffmpegCommand, async (error) => {
        if (error) {
          console.error("❌ Error al generar el sticker animado:", error);
          return await socket.sendMessage(remoteJid, { text: `☠ Error al generar sticker: ${error.message}` });
        }
        await socket.sendMessage(remoteJid, { sticker: fs.readFileSync(webpPath), mimetype: "image/webp" });
      });
    } catch (error) {
      console.error("❌ Error al generar sticker:", error);
      await socket.sendMessage(remoteJid, { text: `☠ Ocurrió un error al generar tu sticker.\n📄 *Detalles*: ${error.message}` });
    }
  },
};
