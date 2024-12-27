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
    if (!args.length) {
      await sendReact("❌");
      console.log("El usuario no proporcionó argumentos.");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    console.log(`Buscando la canción: "${query}"`);
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      // Buscar la canción en YouTube
      const result = await searchYouTubeMusic(query);
      console.log("Resultado de búsqueda:", result);

      if (!result) {
        await sendReact("❌");
        console.log("No se encontraron resultados para la búsqueda.");
        return sendErrorReply("No se encontraron resultados para tu búsqueda.");
      }

      const videoTitle = result.title;
      const videoUrl = `https://www.youtube.com/watch?v=${result.id}`;
      console.log(`Canción encontrada: ${videoTitle} (${videoUrl})`);
      await sendReply(`🎵 Canción encontrada: *${videoTitle}*\n🔗 Enlace: ${videoUrl}`);

      // Obtener la URL de descarga en formato MP3
      await sendWaitReply(`Procesando la descarga de "${videoTitle}"...`);
      const audioUrl = getYouTubeDownloadUrl(videoUrl);
      console.log(`URL de descarga obtenida: ${audioUrl}`);

      if (!audioUrl) {
        await sendReact("❌");
        console.log("No se pudo obtener la URL de descarga.");
        return sendErrorReply("No se pudo obtener la URL de descarga.");
      }

      // Enviar el archivo de audio como mensaje
      console.log(`Enviando archivo de audio: "${videoTitle}"`);
      await socket.sendMessage(remoteJid, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${videoTitle}.mp3`,
      });

      await sendReact("✅");
      await sendReply(`🎶 Descarga completada: "${videoTitle}"`);
    } catch (error) {
      console.error("Error al procesar el comando música:", error);
      await sendReact("❌");
      await sendErrorReply("Hubo un error al procesar tu solicitud. Inténtalo de nuevo.");
    }
  },
};