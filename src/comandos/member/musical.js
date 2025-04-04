const { PREFIX } = require("../../krampus");
const ytSearch = require("yt-search");
const { downloadMusic } = require("../../services/ytdpl");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: "imagenmusical",
  description: "Crea un video con una imagen y 20s de música",
  commands: ["imagenmusical", "imgmusic"],
  usage: `${PREFIX}imagenmusical <nombre de canción> (responde a una imagen)`,
  handle: async ({
    socket,
    remoteJid,
    sendReply,
    sendWaitReact,
    sendSuccessReact,
    isReply,
    isImage,
    downloadImage,
    args,
    webMessage,
    sendMessage,
  }) => {
    try {
      if (!isReply || !isImage) {
        return await sendReply("❌ Debes responder a una imagen para usar este comando.");
      }

      const query = args.join(" ");
      if (!query) {
        return await sendReply("❌ Debes escribir el nombre de la canción después del comando.");
      }

      await sendWaitReact("🎶");

      // Buscar la canción en YouTube
      const search = await ytSearch(query);
      const video = search.videos[0];
      if (!video) return await sendReply("❌ No encontré resultados para esa canción.");

      // Descargar imagen
      const imagePath = path.join(__dirname, "../../temp/img-" + Date.now() + ".jpg");
      const buffer = await downloadImage();
      fs.writeFileSync(imagePath, buffer);

      // Descargar música
      const audioPathFull = await downloadMusic(video.url);
      const audioCropped = audioPathFull.replace(".mp4", "-20s.mp4");

      // Recortar los primeros 20 segundos
      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -i "${audioPathFull}" -t 20 -c copy "${audioCropped}" -y`,
          (err) => (err ? reject(err) : resolve())
        );
      });

      // Combinar imagen + audio
      const outputPath = path.join(__dirname, "../../temp/video-" + Date.now() + ".mp4");

      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -loop 1 -i "${imagePath}" -i "${audioCropped}" -c:v libx264 -t 20 -pix_fmt yuv420p -vf scale=512:-1 "${outputPath}" -y`,
          (err) => (err ? reject(err) : resolve())
        );
      });

      await sendSuccessReact("✅");
      await sendMessage({
        messageType: "video",
        url: outputPath,
        caption: `🎵 Video generado con: ${video.title}`,
      });

      // Limpieza
      fs.unlinkSync(imagePath);
      fs.unlinkSync(audioPathFull);
      fs.unlinkSync(audioCropped);
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error("❌ Error al generar el video:", error);
      await sendReply("❌ Hubo un error al crear el video con música.");
    }
  },
};
