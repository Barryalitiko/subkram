const { PREFIX } = require("../../krampus");
const ytdl = require("ytdl-core"); // Importación de la biblioteca

module.exports = {
  name: "musica",
  description: "Descargar y enviar música de YouTube",
  commands: ["musica"],
  usage: `${PREFIX}musica <nombre de la canción>`,
  handle: async ({
    args,
    sendReply,
    sendWaitReply,
    sendErrorReply,
    sendReact,
    searchYouTubeMusic,
    socket,
    remoteJid,
  }) => {
    if (!args.length) {
      await sendReact("❌");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      const result = await searchYouTubeMusic(query);
      if (!result || !result.videoId) {
        await sendReact("❌");
        return sendErrorReply("No se encontraron resultados para tu búsqueda.");
      }

      const videoTitle = result.title;
      await sendWaitReply(`Descargando "${videoTitle}"...`);

      const videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`;

      // Obtener el stream de audio de YouTube
      const stream = ytdl(videoUrl, {
        filter: 'audioonly',
        quality: 'highestaudio', // Asegurarse de obtener el mejor audio posible
      });

      // Enviar el audio como mensaje
      await socket.sendMessage(remoteJid, {
        audio: stream,
        mimetype: "audio/mpeg",
        fileName: `${videoTitle}.mp3`,
        ptt: true, // PTT (Push-to-talk) es un formato para que el mensaje se envíe como un archivo de voz
      });

      await sendReact("✅");
      await sendReply(`¡Canción enviada!`);
    } catch (error) {
      console.error("Error al procesar el comando música:", error);
      await sendReact("❌");
      await sendErrorReply("Hubo un error al procesar tu solicitud. Inténtalo de nuevo.");
    }
  },
};