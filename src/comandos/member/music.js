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
      // Función fusionada: Buscar y obtener URL de descarga en un solo paso
      const searchAndDownload = async (query) => {
        const ytSearch = require("yt-search");
        const ytdl = require("ytdl-core");

        try {
          const results = await ytSearch(query);
          if (results && results.videos.length > 0) {
            const video = results.videos[0]; // Tomar el primer video
            const videoTitle = video.title;
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