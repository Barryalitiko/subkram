const { PREFIX } = require("../../krampus");

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
    getYouTubeDownloadUrl,
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

      // Ahora utilizamos ytdl-core para obtener el audio directamente
      const videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`;
      
      // Usar ytdl-core para obtener el archivo de audio
      const stream = ytdl(videoUrl, { filter: 'audioonly' });

      // Enviar el audio a WhatsApp
      await socket.sendMessage(remoteJid, {
        audio: stream,
        mimetype: "audio/mpeg",
        fileName: `${videoTitle}.mp3`,
        ptt: true // Opción de "push-to-talk" si el archivo es solo audio
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