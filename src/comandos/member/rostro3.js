const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
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
      const gafasPath = path.resolve(__dirname, "../../../assets/images/gafas.png");
      const lentesPath = path.resolve(__dirname, "../../../assets/images/lentes.png");
      const objetosZ = ["tortuga", "buho", "poderosas", "rosada", "torpe", "kawai", "huesos", "zombie", "sakura", "minato", "popi", "mariposa"];
      
      const rostro = await loadImage(rostroPath);
      const canvas = createCanvas(rostro.width, rostro.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

      if (usuarios[remoteJid].objetos.includes("gafas") || usuarios[remoteJid].objetos.includes("lentes")) {
        let objetoImagen = usuarios[remoteJid].objetos.includes("gafas") ? await loadImage(gafasPath) : await loadImage(lentesPath);
        ctx.drawImage(objetoImagen, 174, 247, 146, 53);
      }

      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      const pngPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
      fs.writeFileSync(pngPath, canvas.toBuffer("image/png"));

      const webpPath = path.resolve(tempPath, `personaje_${remoteJid}.webp`);
      let ffmpegCommand = `ffmpeg -i "${pngPath}"`;
      let tieneAnimacion = false;
      
      for (const objeto of usuarios[remoteJid].objetos) {
        if (objetosZ.includes(objeto)) {
          const objetoPath = path.resolve(__dirname, `../../../assets/images/${objeto}.gif`);
          ffmpegCommand += ` -i "${objetoPath}" -filter_complex "[1:v]scale=200:200[${objeto}];[0:v][${objeto}]overlay=100:50"`;
          tieneAnimacion = true;
          break; 
        }
      }
      
      ffmpegCommand += ` -loop 0 -y "${webpPath}"`;

      if (!tieneAnimacion) {
        exec(`convert "${pngPath}" -loop 0 "${webpPath}"`, async (error) => {
          if (error) {
            console.error("❌ Error al generar el sticker:", error);
            return await socket.sendMessage(remoteJid, { text: `☠ Error al generar sticker: ${error.message}` });
          }
          await socket.sendMessage(remoteJid, { sticker: fs.readFileSync(webpPath), mimetype: "image/webp" });
        });
      } else {
        exec(ffmpegCommand, async (error) => {
          if (error) {
            console.error("❌ Error al generar el sticker animado:", error);
            return await socket.sendMessage(remoteJid, { text: `☠ Error al generar sticker: ${error.message}` });
          }
          await socket.sendMessage(remoteJid, { sticker: fs.readFileSync(webpPath), mimetype: "image/webp" });
        });
      }

      console.log(`✅ [DEBUG] ${remoteJid} ha visto su personaje con:`, usuarios[remoteJid].objetos);
    } catch (error) {
      console.error("❌ Error al generar sticker:", error);
      await socket.sendMessage(remoteJid, { text: `☠ Ocurrió un error al generar tu sticker.\n📄 *Detalles*: ${error.message}` });
    }
  },
};
