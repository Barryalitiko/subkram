const { PREFIX } = require("../../krampus");
const fs = require('fs');
const path = require('path');
const ytdlp = require('yt-dpl');
const ytSearch = require('yt-search');

module.exports = {
  name: "video",
  description: "Buscar y enviar un video",
  commands: ["kram"],
  usage: `${PREFIX}video <nombre del video>`,
  handle: async ({ socket, remoteJid, sendReply, fullArgs }) => {
    try {
      const videoQuery = fullArgs.join(" ");
      if (!videoQuery) {
        await sendReply("❌ Por favor, proporciona el nombre del video que deseas buscar.");
        return;
      }

      const searchResult = await ytSearch(videoQuery);
      const video = searchResult.videos[0];
      if (!video) {
        await sendReply("❌ No se encontró ningún video con ese nombre.");
        return;
      }

      const videoUrl = video.url;
      console.log(`Video encontrado: ${video.title}, URL: ${videoUrl}`);

      const videoFolder = path.join(__dirname, '../../assets/videos');
      if (!fs.existsSync(videoFolder)) {
        fs.mkdirSync(videoFolder, { recursive: true });
      }

      const videoName = `${video.title}.mp4`;
      const videoPath = path.join(videoFolder, videoName);

      await ytdlp.exec(videoUrl, ['-o', videoPath]);
      console.log(`Video descargado correctamente: ${videoPath}`);

      await sendVideoFromFile(videoPath, `Aquí tienes el video: ${video.title}`);
    } catch (error) {
      console.error("Error al buscar o enviar el video:", error);
      await sendReply("❌ Hubo un error al procesar el video.");
    }
  }
};
