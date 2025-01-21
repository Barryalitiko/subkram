const { PREFIX } = require("../../krampus");
const { downloadMusic } = require("../../services/ytdpl");
const ytSearch = require("yt-search");
const fs = require("fs");

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
    sendMusicReact,
    webMessage,
  }) => {
    try {
      const videoQuery = args.join(" ");
      if (!videoQuery) {
        await sendReply(
          "❌ Por favor, proporciona el nombre del video que deseas buscar."
        );
        return;
      }

      // Reacción inicial mientras buscamos y descargamos
      await sendWaitReact("⏳");

      // Realizamos la búsqueda en YouTube
      const searchResult = await ytSearch(videoQuery);
      const video = searchResult.videos[0];
      if (!video) {
        await sendReply(
          "❌ No se encontró ningún video con ese nombre.",
          { quoted: webMessage } // Responde al mensaje del usuario
        );
        return;
      }

      const videoUrl = video.url;
      const videoTitle = video.title;
      const videoDuration = video.timestamp.split(":").slice(-2).join(":"); // Minutos y segundos

      console.log(`Video encontrado: ${videoTitle}, URL: ${videoUrl}`);

      // Formateamos el mensaje con la duración y el título
      const message = `1:10━━━━●───── ${videoDuration}
\n${videoTitle}
> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎`;

      // Enviamos el mensaje con el nuevo texto
      await sendReply(message, { quoted: webMessage });

      // Llamamos a la función downloadMusic para descargar la música
      const musicPath = await downloadMusic(videoUrl);
      console.log(`Música descargada correctamente: ${musicPath}`);

      // Reacción para indicar que la música está lista
      await sendMusicReact("🎵");

      // Enviar la música como archivo, respondiendo al mensaje del usuario
      await socket.sendMessage(remoteJid, {
        audio: { url: musicPath },
        mimetype: "audio/mp4",
        caption: `🎶 Aquí tienes la música: ${videoTitle}`,
        quoted: webMessage, // Responder al mensaje original del usuario
        ptt: false, // No es un mensaje de voz
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
      }, 1 * 60 * 1000); // Eliminar después de 1 minuto
    } catch (error) {
      console.error("Error al descargar o enviar la música:", error);
      await sendReply(
        "❌ Hubo un error al procesar la música.",
        { quoted: webMessage } // Responder al mensaje original del usuario
      );
    }
  },
};