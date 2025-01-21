```
const fs = require("fs");
const { PREFIX } = require("../../krampus");
const { downloadMusic } = require("../../services/ytdpl");
const ytSearch = require("yt-search");

module.exports = {
  name: "musica",
  description: "Descargar y enviar música desde YouTube",
  commands: ["musica", "m"],
  usage: `${PREFIX}musica <nombre del video>`,
  handle: async ({
    socket,
    remoteJid,
    sendReply,
    args,
    sendWaitReact,
    userJid,
    webMessage,
  }) => {
    try {
      const videoQuery = args.join(" ");
      if (!videoQuery) {
        await sendReply("❌ Por favor, proporciona el nombre del video que deseas buscar.");
        return;
      }

      // Reacción inicial mientras buscamos y descargamos
      await sendWaitReact("⏳");
      await sendReply(" Estoy buscando y descargando la música, por favor espera...");

      // Realizamos la búsqueda en YouTube
      const searchResult = await ytSearch(videoQuery);
      const video = searchResult.videos[0];
      if (!video) {
        await sendReply("❌ No se encontró ningún video con ese nombre.");
        return;
      }

      const videoUrl = video.url;
      console.log(`Video encontrado: ${video.title}, URL: ${videoUrl}`);

      // Descargar la música
      const musicPath = await downloadMusic(videoUrl);
      console.log(`Música descargada correctamente: ${musicPath}`);

      // Enviar la música como archivo, respondiendo al mensaje original del usuario
      await sendReply({
        audio: { url: musicPath },
        mimetype: "audio/mp4",
        caption: `Aquí tienes la música  - ${video.title}`,
        quoted: webMessage,
        ptt: false,
      });

      // Reaccionar con el emoji cuando el audio esté enviado
      const sendMusicReact = async (emoji) => {
        await socket.react({
          key: {
            remoteJid: remoteJid,
            id: webMessage.key.id,
            participant: webMessage.key.participant,
          },
          text: emoji,
        });
      };
      await sendMusicReact("🎵");

      // Eliminar el archivo después de enviarlo
      setTimeout(() => {
        fs.unlink(musicPath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo de música: ${err}`);
          } else {
            console.log(`Archivo de música eliminado: ${musicPath}`);
          }
        });
      }, 1 * 60 * 1000); // Eliminar después de 1 minuto
    } catch (error) {
      console.error("Error al descargar o enviar la música:", error);
      await sendReply("❌ Hubo un error al procesar la música.");
    }
  },
};
```