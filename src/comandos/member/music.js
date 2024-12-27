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
      // Función para buscar y obtener la URL de descarga
      const searchAndDownload = async (query) => {
        const ytSearch = require("yt-search");
        const ytdl = require("ytdl-core");

        try {
          const results = await ytSearch(query);
          if (results && results.videos.length > 0) {
            const video = results.videos[0]; // Tomar el primer video
            const videoUrl = video.url;

            if (!ytdl.validateURL(videoUrl)) {
              throw new Error("URL de video inválida.");
            }

            const info = await ytdl.getInfo(videoUrl);
            const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

            const mp3Format = audioFormats.find((format) => format.container === "mp3");

            if (!mp3Format) {
              throw new Error("No se encontró un formato de audio MP3.");
            }

            return mp3Format.url; // Retorna la URL de descarga
          } else {
            throw new Error("No se encontraron resultados para la búsqueda.");
          }
        } catch (error) {
          throw new Error("No se pudo obtener la URL de descarga.");
        }
      };

      const audioUrl = await searchAndDownload(query);

      // Enviar el audio directamente desde la URL
      await socket.sendMessage(remoteJid, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
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