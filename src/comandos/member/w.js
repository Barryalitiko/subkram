const { PREFIX } = require("../../krampus");
const { downloadMusic } = require("../../services/ytdpl"); // Asumimos que el script está en "services/ytdpl.js"
const ytSearch = require('yt-search');

module.exports = {
  name: "musica",
  description: "Descargar y enviar música desde YouTube",
  commands: ["musica"],
  usage: `${PREFIX}musica <nombre del video>`,
  handle: async ({ socket, remoteJid, sendReply, args }) => {
    try {
      const videoQuery = args.join(" ");
      if (!videoQuery) {
        await sendReply("❌ Por favor, proporciona el nombre del video que deseas buscar.");
        return;
      }

      await sendReply("🔄 Estoy buscando y descargando la música, por favor espera...");

      // Realizamos la búsqueda en YouTube
      const searchResult = await ytSearch(videoQuery);
      const video = searchResult.videos[0];
      if (!video) {
        await sendReply("❌ No se encontró ningún video con ese nombre.");
        return;
      }

      const videoUrl = video.url;
      console.log(`Video encontrado: ${video.title}, URL: ${videoUrl}`);

      // Llamamos al script para descargar la música
      const musicPath = await downloadMusic(videoUrl);
      console.log(`Música descargada correctamente: ${musicPath}`);

      // Enviamos la música como archivo
      await socket.sendMessage(remoteJid, {
        audio: { url: musicPath },
        mimetype: "audio/mp4",  // El formato es mp4 para WhatsApp, aunque sea mp3
        caption: `Aquí tienes la música 🎶 - ${video.title}`,
        ptt: false  // No es un mensaje de nota de voz
      });

      // Eliminar el archivo después de enviarlo
      setTimeout(() => {
        fs.unlink(musicPath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo de música: ${err}`);
          } else {
            console.log(`Archivo de música eliminado: ${musicPath}`);
          }
        });
      }, 3 * 60 * 1000);  // Eliminar después de 3 minutos
    } catch (error) {
      console.error("Error al descargar o enviar la música:", error);
      await sendReply("❌ Hubo un error al procesar la música.");
    }
  }
};