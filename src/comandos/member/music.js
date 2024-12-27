const { PREFIX } = require("../../krampus");  // Asegúrate de importar el prefijo desde tu configuración
const { ytSearch } = require("yt-search");
const ytdl = require("ytdl-core");

module.exports = {
  name: "musica",
  description: "Descargar música de YouTube en formato MP3",
  commands: ["musica"],
  usage: `${PREFIX}musica <nombre de la canción>`,
  handle: async ({
    args,
    sendReply,
    sendWaitReply,
    sendErrorReply,
    sendReact,
    socket,
    remoteJid,
    fullMessage,  // Asegúrate de obtener el mensaje completo
    prefix
  }) => {
    // Verificar si el mensaje comienza con el prefijo
    if (!fullMessage.startsWith(prefix)) {
      return;
    }

    if (!args.length) {
      await sendReact("❌");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      // Buscar el video de YouTube
      const results = await ytSearch(query);
      if (!results || results.videos.length === 0) {
        throw new Error("No se encontraron resultados para la búsqueda.");
      }

      const video = results.videos[0]; // Tomar el primer video
      const videoUrl = video.url;

      // Obtener el enlace de descarga del audio MP3
      const info = await ytdl.getInfo(videoUrl);
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

      const mp3Format = audioFormats.find((format) => format.container === "mp3");

      if (!mp3Format) {
        throw new Error("No se encontró un formato de audio MP3.");
      }

      // Enviar el enlace de la canción
      await sendReply(`🎵 Aquí está el enlace de la canción: ${videoUrl}`);

      // Descargar el archivo MP3 y enviarlo
      const audioUrl = mp3Format.url;
      const audioBuffer = await fetch(audioUrl).then((res) => res.arrayBuffer());

      // Enviar el audio al grupo
      await socket.sendMessage(remoteJid, {
        audio: {
          buffer: audioBuffer,
        },
        mimetype: "audio/mpeg",
        fileName: `${query}.mp3`,
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