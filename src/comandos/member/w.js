const { PREFIX } = require("../../krampus");
const { downloadMusic } = require("../../services/ytdpl");
const ytSearch = require('yt-search');

module.exports = {
  name: "musica",
  description: "Descargar y enviar música desde YouTube",
  commands: ["musica", "m"],
  usage: `${PREFIX}musica <nombre del video>`,
  handle: async ({ socket, remoteJid, sendReply, args, sendWaitReact, sendMusicReact, userJid, webMessage }) => {
    try {
      const videoQuery = args.join(" ");
      if (!videoQuery) {
        await sendReply("❌ Por favor, proporciona el nombre del video que deseas buscar.");
        return;
      }

      // Reacción inicial mientras buscamos y descargamos
      await sendWaitReact("⏳");

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

      // Llamamos a la función downloadMusic para descargar la música
      const musicPath = await downloadMusic(videoUrl);
      console.log(`Música descargada correctamente: ${musicPath}`);

      // Reacción para indicar que la música está lista
      await sendMusicReact("🎵");

      // Enviar la música como archivo, respondiendo al mensaje de quien usó el comando
      await socket.sendMessage(remoteJid, {
        audio: { url: musicPath },
        mimetype: "audio/mp4",  // El formato es mp4 para WhatsApp, aunque sea mp3
        caption: `Aquí tienes la música 🎶 - ${video.title}`,
        quoted: webMessage,  // Responde al mensaje original
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
      }, 1 * 60 * 1000);  // Eliminar después de 3 minutos
    } catch (error) {
      console.error("Error al descargar o enviar la música:", error);
      await sendReply("❌ Hubo un error al procesar la música.");
    }
  }
};