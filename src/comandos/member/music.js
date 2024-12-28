const { PREFIX } = require("../../krampus");

module.exports = {
  name: "musica",
  description: "Buscar y descargar música desde YouTube",
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
    console.log("[MUSICA] Comando recibido con argumentos:", args);

    // Validar si se proporcionaron argumentos
    if (!args.length) {
      await sendReact("❌");
      console.log("[MUSICA] No se proporcionaron argumentos.");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    console.log("[MUSICA] Buscando en YouTube con el query:", query);
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      // Buscar la canción en YouTube
      const result = await searchYouTubeMusic(query);
      console.log("[MUSICA] Resultado de búsqueda:", result);

      if (!result || !result.videoId) {
        await sendReact("❌");
        console.log("[MUSICA] No se encontraron resultados para:", query);
        return sendErrorReply("No se encontraron resultados para tu búsqueda.");
      }

      const videoTitle = result.title;
      const videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`;
      console.log("[MUSICA] Canción encontrada:", videoTitle, videoUrl);
      await sendReply(`🎵 Canción encontrada: *${videoTitle}*\n🔗 Enlace: ${videoUrl}`);

      // Obtener la URL de descarga en formato MP3
      await sendWaitReply(`Procesando la descarga de "${videoTitle}"...`);
      console.log("[MUSICA] Iniciando obtención de la URL de descarga para:", videoUrl);

      const audioUrl = await getYouTubeDownloadUrl(videoUrl);
      console.log("[MUSICA] URL de descarga obtenida:", audioUrl);

      if (!audioUrl) {
        await sendReact("❌");
        console.log("[MUSICA] No se pudo obtener la URL de descarga para:", videoUrl);
        return sendErrorReply("No se pudo obtener la URL de descarga.");
      }

      // Enviar el archivo de audio como mensaje
      await socket.sendMessage(remoteJid, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${videoTitle}.mp3`,
      });

      await sendReact("✅");
      console.log("[MUSICA] Descarga completada y enviada:", videoTitle);
      await sendReply(`🎶 Descarga completada: "${videoTitle}"`);
    } catch (error) {
      console.error("[MUSICA] Error al procesar el comando:", error.message);
      await sendReact("❌");
      await sendErrorReply("Hubo un error al procesar tu solicitud. Inténtalo de nuevo.");
    }
  },
};