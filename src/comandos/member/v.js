const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");
const ytSearch = require("yt-search");
const { downloadVideo } = require("../../services/ytdpl");

module.exports = {
  name: "video",
  description: "Buscar y enviar un video",
  commands: ["kramp"],
  usage: `${PREFIX}video <nombre del video>`,
  handle: async ({ sock, remoteJid, sendReply, fullArgs }) => {
    try {
      const videoQuery = fullArgs.join(" ");
      if (!videoQuery) {
        await sendReply("❌ Por favor, proporciona el nombre del video que deseas buscar.");
        return;
      }

      // Buscar el video usando yt-search
      const searchResult = await ytSearch(videoQuery);
      const video = searchResult.videos[0];
      if (!video) {
        await sendReply("❌ No se encontró ningún video con ese nombre.");
        return;
      }

      const videoUrl = video.url;
      console.log(`Video encontrado: ${video.title}, URL: ${videoUrl}`);

      // Descargar el video usando la función downloadVideo
      const videoPath = await downloadVideo(videoUrl);
      if (!videoPath) {
        await sendReply("❌ Hubo un error al descargar el video.");
        return;
      }

      // Enviar el video a través de Baileys
      await sock.sendMessage(
        remoteJid,
        {
          video: { url: `./assets/videos/${path.basename(videoPath)}` },
          caption: `Aquí tienes el video: ${video.title}`,
          ptv: false, // Enviar como video normal
        }
      );
    } catch (error) {
      console.error("Error al buscar o enviar el video:", error);
      await sendReply("❌ Hubo un error al procesar el video.");
    }
  },
};