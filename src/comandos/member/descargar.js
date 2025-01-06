const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const axios = require("axios");
const { PREFIX } = require("../../krampus"); // Asumiendo que este es el archivo donde está el PREFIX

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Desactiva la verificación SSL (temporal, no recomendado en producción)

const getBuffer = (url, options) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Request": 1,
        range: "bytes=0-",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36', // User-agent personalizado
      },
      ...options,
      responseType: "arraybuffer",
      proxy: options?.proxy || false,
    })
    .then((res) => {
      resolve(res.data);
    })
    .catch(reject);
  });
};

module.exports = {
  name: "musica",
  description: "Busca y envía música desde YouTube",
  commands: ["musica", "play"],
  usage: `${PREFIX}musica <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (args.length < 1) {
      await sendReply(`Uso incorrecto. Por favor, proporciona el nombre de la canción o el URL. Ejemplo: ${PREFIX}musica [nombre o URL]`);
      return;
    }

    const query = args.join(" ");
    console.log(`[MUSICA] Buscando música para: ${query}`);

    try {
      // Buscar música en YouTube usando yt-search
      const results = await ytSearch(query);
      if (!results || results.videos.length === 0) {
        return await sendReply("No se encontraron resultados para la búsqueda.");
      }

      // Obtener el primer resultado de video
      const video = results.videos[0];
      console.log(`[MUSICA] Video encontrado: ${video.title} - ${video.url}`);

      // Obtener información del video con ytdl
      const info = await ytdl.getInfo(video.url, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36', // User-agent personalizado
          },
        },
      });
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
      const audioBuffer = await getBuffer(audioUrl);
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