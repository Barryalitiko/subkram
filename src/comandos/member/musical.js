const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const { exec } = require("child_process");
const axios = require("axios");

module.exports = {
  name: "musical",
  description: "Convierte una imagen en un video con música de 20 segundos",
  commands: ["musical"],
  usage: `${PREFIX}musical <nombre de la canción> (responde a una imagen)`,
  handle: async ({
    socket,
    remoteJid,
    sendReply,
    args,
    webMessage,
    sendWaitReact,
    sendSuccessReact,
  }) => {
    try {
      if (!webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return await sendReply("❌ Debes responder a una imagen para usar este comando.");
      }

      const quotedMessage = webMessage.message.extendedTextMessage.contextInfo.quotedMessage;

      const mediaBuffer = await socket.downloadMediaMessage({
        message: quotedMessage,
      });

      const query = args.join(" ");
      if (!query) return await sendReply("❌ Debes indicar el nombre de la canción.");

      await sendWaitReact("🎵");

      const search = await ytSearch(query);
      const video = search.videos[0];
      if (!video) return await sendReply("❌ No se encontró ningún video.");

      const videoUrl = video.url;
      const audioPath = path.join(__dirname, "../../temp/audio-" + Date.now() + ".mp3");

      // Descargar audio de 20s
      await new Promise((resolve, reject) => {
        const command = `yt-dlp -f bestaudio -x --audio-format mp3 --postprocessor-args "-t 20" -o "${audioPath}" "${videoUrl}"`;
        exec(command, (err, stdout, stderr) => {
          if (err) {
            console.error("Error al descargar audio:", err);
            return reject(err);
          }
          resolve();
        });
      });

      const imagePath = path.join(__dirname, "../../temp/image-" + Date.now() + ".jpg");
      fs.writeFileSync(imagePath, mediaBuffer);

      const outputPath = path.join(__dirname, "../../temp/video-" + Date.now() + ".mp4");

      // Combinar imagen + audio en video
      await new Promise((resolve, reject) => {
        const ffmpegCmd = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -t 20 -pix_fmt yuv420p -vf "scale=512:512" -y "${outputPath}"`;
        exec(ffmpegCmd, (err, stdout, stderr) => {
          if (err) {
            console.error("Error al generar el video:", err);
            return reject(err);
          }
          resolve();
        });
      });

      await sendSuccessReact("🎬");

      await socket.sendMessage(remoteJid, {
        video: fs.readFileSync(outputPath),
        caption: `🎶 Video creado con: ${video.title}`,
        mimetype: "video/mp4",
      });

      fs.unlinkSync(audioPath);
      fs.unlinkSync(imagePath);
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error("Error en comando musical:", error);
      await sendReply("❌ Error al generar el video.");
    }
  },
};
