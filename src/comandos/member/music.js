const { PREFIX } = require("../../krampus");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");

module.exports = {
  name: "ytsearch",
  description: "Busca un video en YouTube y te envía el enlace o audio.",
  commands: ["ytsearch", "searchyt"],
  usage: `${PREFIX}ytsearch <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (args.length < 1) {
      console.log("Uso incorrecto. No se proporcionó consulta.");
      return await sendReply(`Uso incorrecto. Por favor, proporciona el nombre de la canción o el URL. Ejemplo: ${PREFIX}ytsearch [nombre o URL]`);
    }

    const query = args.join(" ");
    console.log(`Buscando video para: ${query}`);

    try {
      // Buscar video en YouTube
      const results = await ytSearch(query);
      console.log(`Resultados de búsqueda obtenidos: ${results.videos.length} videos encontrados.`);

      if (!results || results.videos.length === 0) {
        console.log("No se encontraron videos.");
        return await sendReply("No se encontraron resultados para la búsqueda.");
      }

      // Obtener el primer resultado de video
      const video = results.videos[0];
      console.log(`Video encontrado: ${video.title} - URL: ${video.url}`);

      // Enviar enlace del video encontrado
      await sendReply(`🎥 Aquí está el video encontrado: ${video.url}`);

      // Descargar el audio del video
      const info = await ytdl.getInfo(video.url);
      console.log("Información del video obtenida.");
      
      const audioUrl = info.formats.find(format => format.container === 'mp4' && format.audioCodec === 'aac').url;
      console.log(`URL del audio extraída: ${audioUrl}`);

      // Enviar el enlace de descarga del audio
      await sendReply(`🎶 Aquí está el enlace para descargar el audio: ${audioUrl}`);

    } catch (error) {
      console.error(`Error al buscar o procesar el video: ${error}`);
      await sendReply("Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
    }
  },
};