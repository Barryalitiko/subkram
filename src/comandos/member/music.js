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

    // Validar argumentos
    if (!args.length) {
      console.log("[MUSICA] Error: No se proporcionaron argumentos.");
      await sendReact("❌");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    console.log(`[MUSICA] Iniciando búsqueda para: "${query}"`);
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      // Buscar la canción en YouTube
      const result = await searchYouTubeMusic(query);
      console.log("[MUSICA] Resultado de búsqueda:", result);

      if (!result || !result.videoId) {
        console.log("[MUSICA] Error: No se encontraron resultados.");
        await sendReact("❌");
        return sendErrorReply("No se encontraron resultados para tu búsqueda.");
      }

      const videoTitle = result.title;
      const videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`;
      console.log("[MUSICA] Canción encontrada:", videoTitle, videoUrl);

      await sendReply(
        `🎵 Canción encontrada: *${videoTitle}*\n🔗 Enlace: ${videoUrl}`
      );

      // Obtener la URL de descarga en formato MP3
      console.log(`[MUSICA] Procesando descarga para: "${videoTitle}"`);
      await sendWaitReply(`Procesando la descarga de "${videoTitle}"...`);
      const audioUrl = await getYouTubeDownloadUrl(videoUrl);

      if (!audioUrl) {
        console.log("[MUSICA] Error: No se pudo obtener la URL de descarga.");
        await sendReact("❌");
        return sendErrorReply("No se pudo obtener la URL de descarga.");
      }

      console.log("[MUSICA] URL de descarga obtenida:", audioUrl);

      // Enviar el archivo de audio como mensaje
      console.log("[MUSICA] Enviando archivo de audio al usuario.");
      await socket.sendMessage(remoteJid, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${videoTitle}.mp3`,
      });

      console.log("[MUSICA] Archivo enviado con éxito.");
      await sendReact("✅");
      await sendReply(`🎶 Descarga completada: "${videoTitle}"`);
    } catch (error) {
      console.error("[MUSICA] Error al procesar el comando:", error);
      await sendReact("❌");
      await sendErrorReply(
        "Hubo un error al procesar tu solicitud. Inténtalo de nuevo."
      );
    }
  },
};