const { BOT_EMOJI } = require("../krampus");
const { extractDataFromMessage, baileysIs, download } = require(".");
const { waitMessage } = require("./messages");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

exports.loadCommonFunctions = ({ socket, webMessage }) => {
  const {
    args,
    commandName,
    fullArgs,
    fullMessage,
    isReply,
    prefix,
    remoteJid,
    replyJid,
    userJid,
  } = extractDataFromMessage(webMessage);

  if (!remoteJid) {
    return null;
  }

  const isImage = baileysIs(webMessage, "image");
  const isVideo = baileysIs(webMessage, "video");
  const isSticker = baileysIs(webMessage, "sticker");

  const downloadImage = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "image", "png");
  };

  const downloadSticker = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "sticker", "webp");
  };

  const downloadVideo = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "video", "mp4");
  };

  const basicYoutubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  const isValidYoutubeUrl = (url) => basicYoutubeRegex.test(url);

  const sendReply = async (text) => {
    return await socket.sendMessage(
      remoteJid,
      { text: `${BOT_EMOJI} ${text}` },
      { quoted: webMessage }
    );
  };

  const sendReact = async (emoji) => {
    return await socket.sendMessage(remoteJid, {
      react: {
        text: emoji,
        key: webMessage.key,
      },
    });
  };

   const sendTagReact = async () => {
    return await sendReact("📌");
  };
  
  const sendDirtReact = async () => {
    return await sendReact("🚯");
  };
  
  const sendOpenReact = async () => {
    return await sendReact("🔓");
  };
  
   const sendCloseReact = async () => {
    return await sendReact("🔒");
  };

  const sendSuccessReact = async () => {
    return await sendReact("✅");
  };

  const sendWaitReact = async () => {
    return await sendReact("⏳");
  };

  const sendWarningReact = async () => {
    return await sendReact("⚠️");
  };

  const sendErrorReact = async () => {
    return await sendReact("❌");
  };

  const sendSuccessReply = async (text) => {
    await sendSuccessReact();
    return await sendReply(`👻 ${text}`);
  };

  const sendWaitReply = async (text) => {
    await sendWaitReact();
    return await sendReply(`⏳ Espera! ${text || waitMessage}`);
  };

  const sendWarningReply = async (text) => {
    await sendWarningReact();
    return await sendReply(`⚠️ Advertencia! ${text}`);
  };

  const sendErrorReply = async (text) => {
    await sendErrorReact();
    return await sendReply(`☠ Error! ${text}`);
  };
const sendStickerFromFile = async (file) => {
    return await socket.sendMessage(
      remoteJid,
      {
        sticker: fs.readFileSync(file),
      },
      { quoted: webMessage }
    );
  };

  const sendStickerFromURL = async (url) => {
    return await socket.sendMessage(
      remoteJid,
      {
        sticker: { url },
      },
      { url, quoted: webMessage }
    );
  };

  const sendImageFromFile = async (file, caption = "") => {
    return await socket.sendMessage(
      remoteJid,
      {
        image: fs.readFileSync(file),
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
      },
      { quoted: webMessage }
    );
  };

  const sendImageFromURL = async (url, caption = "") => {
    return await socket.sendMessage(
      remoteJid,
      {
        image: { url },
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
      },
      { url, quoted: webMessage }
    );
  };

  const sendAudioFromURL = async (url) => {
    return await socket.sendMessage(
      remoteJid,
      {
        audio: { url },
        mimetype: "audio/mpeg",
      },
      { url, quoted: webMessage }
    );
  };
  // Función para buscar música en YouTube usando yt-search
  const searchYouTubeMusic = async (query) => {
    try {
      const results = await ytSearch(query);
      if (results && results.videos.length > 0) {
        return results.videos[0]; // Retorna el primer resultado de video
      }
      throw new Error("No se encontraron resultados para la búsqueda.");
    } catch (error) {
      throw new Error("No se pudo buscar la música en YouTube.");
    }
  };

  // Función principal para descargar audio de YouTube
  const downloadYouTubeAudio = async (videoUrl) => {
    try {
      console.log("[MUSICA] Validando URL de YouTube:", videoUrl);

      // Validar la URL con ytdl-core
      if (!ytdl.validateURL(videoUrl)) {
        throw new Error("URL no válida de YouTube.");
      }

      // Obtener información del video
      const info = await ytdl.getInfo(videoUrl);
      const videoDetails = info.videoDetails;
      const title = videoDetails.title.replace(/[^\w\s]/gi, ""); // Limpiar título
      const duration = videoDetails.lengthSeconds;
      const author = videoDetails.author.name;

      console.log(`[MUSICA] Título: ${title}`);
      console.log(`[MUSICA] Duración: ${duration} segundos`);
      console.log(`[MUSICA] Autor: ${author}`);

      // Filtrar formatos de audio y elegir el mejor
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      if (!audioFormats.length) {
        throw new Error("No se encontraron formatos de audio disponibles.");
      }
      const bestAudioFormat = ytdl.chooseFormat(audioFormats, {
        quality: "highestaudio",
      });

      console.log("[MUSICA] Mejor formato de audio seleccionado:", bestAudioFormat);

      // Crear ruta para guardar el archivo
      const outputDir = path.resolve(__dirname, "downloads");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir); // Crear carpeta si no existe
      }
      const filePath = path.join(outputDir, `${title}.mp3`);

      // Descargar el archivo
      console.log("[MUSICA] Iniciando descarga...");
      const audioStream = ytdl(videoUrl, { format: bestAudioFormat });

      const writeStream = fs.createWriteStream(filePath);
      audioStream.pipe(writeStream);

      // Escuchar eventos de progreso
      audioStream.on("progress", (chunkLength, downloaded, total) => {
        const percent = ((downloaded / total) * 100).toFixed(2);
        console.log(`[MUSICA] Descarga en progreso: ${percent}%`);
      });

      return new Promise((resolve, reject) => {
        writeStream.on("finish", () => {
          console.log("[MUSICA] Descarga completada:", filePath);
          resolve(filePath); // Devolver la ruta del archivo descargado
        });

        writeStream.on("error", (error) => {
          console.error("[MUSICA] Error al guardar el archivo:", error.message);
          reject(error);
        });
      });
    } catch (error) {
      console.error("[MUSICA] Error:", error.message);
      throw new Error(
        "Ocurrió un error al procesar el video. Inténtalo nuevamente."
      );
    }
  };

  return {
    args,
    commandName,
    downloadVideo,
    fullArgs,
    fullMessage,
    isReply,
    isSticker,
    isVideo,
    prefix,
    remoteJid,
    replyJid,
    socket,
    userJid,
    webMessage,
    sendAudioFromURL,
    sendReact,
    sendReply,
    sendStickerFromFile,
    sendStickerFromURL,
    sendSuccessReply,
    sendWaitReply,
    sendWarningReact,
    sendWarningReply,
    sendErrorReply,
    searchYouTubeMusic, // Mantengo la función de búsqueda
    downloadYouTubeAudio, // Añadida al objeto retornado
  };
};
