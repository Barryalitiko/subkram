const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");
const { downloadVideo } = require("../../services/ytdpl"); // Asegúrate de que esta ruta sea correcta
const ytSearch = require("yt-search");

module.exports = {
  name: "video",
  description: "Buscar y enviar un video",
  commands: ["video", "v"],
  usage: `${PREFIX}video <nombre del video>`,
  handle: async ({ socket, remoteJid, sendReply, args, sendReact, webMessage }) => {
    try {
      const videoQuery = args.join(" ");
      if (!videoQuery) {
        await sendReply("❌ Por favor, proporciona el nombre del video que deseas buscar.");
        return;
      }

      // Responder con un mensaje de "procesando..."
      await sendReply(`> Krampus Bot👻
        procesando...`);

      // Reaccionar con ⏳ al recibir el comando
      await sendReact("⏳", webMessage.key);

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

      // Cambiar la reacción a 🎬 una vez que el video se descargó
      await sendReact("🎬", webMessage.key);

      // Enviar el video descargado
      await socket.sendMessage(remoteJid, {
        video: { url: videoPath },
        caption: `> Krampus OM bot\n${video.title}`,
        quoted: webMessage, // Responde al mensaje original del usuario
        ptt: false, // Enviar como video normal, no como nota
      });

      // Eliminar el archivo después de enviarlo
      setTimeout(() => {
        fs.unlink(videoPath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo de video: ${err}`);
          } else {
            console.log(`Archivo de video eliminado: ${videoPath}`);
          }
        });
      }, 1 *