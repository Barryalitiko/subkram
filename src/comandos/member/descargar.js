const { PREFIX } = require("../../krampus");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");

module.exports = {
  name: "musica",
  description: "Busca y envía música desde YouTube",
  commands: ["musica", "play"],
  usage: `${PREFIX}musica <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket, sendAudioFromURL }) => {
    if (args.length < 1) {
      await sendReply(
        `Uso incorrecto. Proporciona el nombre de la canción o el URL. Ejemplo: ${PREFIX}musica [nombre o URL]`
      );
      return;
    }
    const query = args.join(" ");
    console.log(`[MUSICA] Buscando música para: ${query}`);

    try {
      // Paso 1: Buscar música en YouTube usando yt-search
      console.log("[MUSICA] Iniciando búsqueda en YouTube...");
      const results = await ytSearch(query);
      if (!results || results.videos.length === 0) {
        console.warn("[MUSICA] No se encontraron resultados.");
        return await sendReply("No se encontraron resultados.");
      }

      // Obtener el primer resultado de video
      const video = results.videos[0];
      console.log(`[MUSICA] Video encontrado: ${video.title} - ${video.url}`);

      // Paso 2: Obtener la información del video con ytdl-core
      console.log(`[MUSICA] Obteniendo información con ytdl para: ${video.url}`);
      const info = await ytdl.getInfo(video.url);
      console.log("[MUSICA] Información obtenida.");

      // Filtrar formatos de solo audio
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      if (!audioFormats || audioFormats.length === 0) {
        console.warn("[MUSICA] No se encontraron formatos de audio.");
        return await sendReply("No se encontraron formatos de audio compatibles.");
      }

      const audioUrl = audioFormats[0].url;
      console.log(`[MUSICA] URL de audio obtenido: ${audioUrl}`);

      // Paso 3: Usar sendAudioFromURL para enviar el archivo
      console.log("[MUSICA] Enviando audio al usuario...");
      await sendAudioFromURL(audioUrl);
      console.log(`[MUSICA] Audio enviado con éxito: ${video.title}`);
    } catch (error) {
      console.error(`[MUSICA] Error: ${error.message}`);
      await sendReply(
        "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo."
      );
    }
  },
};