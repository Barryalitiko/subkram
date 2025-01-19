const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");
const { downloadVideo } = require("../../services/ytdpl"); // Asegúrate de que esta ruta sea correcta
const ytSearch = require("yt-search");

module.exports = {
  name: "video",
  description: "Buscar y enviar un video",
  commands: ["kram"],
  usage: `${PREFIX}video <nombre del video>`,
  handle: async ({ socket, remoteJid, sendReply, args }) => {
    try {
      const videoQuery = args.join(" ");
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

      // Descargar el video usando yt-dlp
      const videoPath = await downloadVideo(videoUrl);

      // Enviar el video descargado
      await socket.sendMessage(remoteJid, {
        video: { url: videoPath },
        caption: `Aquí tienes el video: ${video.title}`,
        ptv: false // Enviar como video normal, no video nota
      });
    } catch (error) {
      console.error("Error al buscar o enviar el video:", error);
      await sendReply("❌ Hubo un error al procesar el video.");
    }
  }
};