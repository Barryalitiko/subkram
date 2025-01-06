const { PREFIX } = require("../../krampus");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const axios = require("axios");

exports.getBuffer = (url, options) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Request": 1,
        range: "bytes=0-",
      },
      ...options,
      responseType: "arraybuffer",
      proxy: options?.proxy || false,
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        console.error("Error al obtener el buffer:", error.message);
        reject(error);
      });
  });
};

module.exports = {
  name: "musica",
  description: "Busca y envía música desde YouTube",
  commands: ["musica", "play"],
  usage: `${PREFIX}musica <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (args.length < 1) {
      await sendReply(
        `Uso incorrecto. Por favor, proporciona el nombre de la canción o el URL. Ejemplo: ${PREFIX}musica [nombre o URL]`
      );
      return;
    }

    const query = args.join(" ");
    console.log(`[MUSICA] Buscando música para: ${query}`);

    try {
      // Buscar música en YouTube usando yt-search
      console.log("[MUSICA] Ejecutando ytSearch...");
      const results = await ytSearch(query);

      if (!results || results.videos.length === 0) {
        console.warn("[MUSICA] No se encontraron resultados en ytSearch.");
        return await sendReply("No se encontraron resultados para la búsqueda.");
      }

      // Obtener el primer resultado de video
      const video = results.videos[0];
      console.log(`[MUSICA] Video encontrado: ${video.title} - ${video.url}`);

      // Descargar el audio del video
      console.log(`[MUSICA] Obteniendo información de ytdl para: ${video.url}`);
      const info = await ytdl.getInfo(video.url);
      console.log("[MUSICA] Información de video obtenida.");

      const audioFormat = info.formats.find(
        (format) => format.container === "mp4" && format.audioCodec === "aac"
      );

      if (!audioFormat) {
        console.warn("[MUSICA] No se encontró un formato de audio compatible.");
        return await sendReply("No se pudo encontrar un formato de audio compatible.");
      }

      const audioUrl = audioFormat.url;
      console.log(`[MUSICA] URL de audio obtenido: ${audioUrl}`);

      console.log("[MUSICA] Descargando audio...");
      const audioBuffer = await exports.getBuffer(audioUrl);
      console.log("[MUSICA] Audio descargado con éxito.");

      // Enviar el audio al usuario
      await socket.sendMessage(remoteJid, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        caption: `🎶 Aquí tienes: ${video.title}`,
      });
      console.log(`[MUSICA] Audio enviado con éxito: ${video.title}`);
    } catch (error) {
      console.error(`[MUSICA] Error al buscar o descargar el audio: ${error.message}`);
      await sendReply("Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
    }
  },
};