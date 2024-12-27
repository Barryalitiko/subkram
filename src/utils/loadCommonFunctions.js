const { BOT_EMOJI } = require("../krampus");
const { extractDataFromMessage } = require(".");
const { waitMessage } = require("./messages");
const ytSearch = require("yt-search"); // Cambiar a yt-search
const ytdl = require("ytdl-core"); // Biblioteca de descarga

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

  // Funciones para enviar texto y respuestas
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

  const sendSuccessReply = async (text) => {
    await sendReact("✅");
    return await sendReply(`✅ ${text}`);
  };

  const sendWaitReply = async (text) => {
    await sendReact("⏳");
    return await sendReply(`⏳ Aguarde! ${text || "Procesando..."}`);
  };

  const sendErrorReply = async (text) => {
    await sendReact("❌");
    return await sendReply(`❌ Error! ${text}`);
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

  const searchAndDownloadYouTubeMusic = async (query) => {
  try {
    // Buscar el video en YouTube
    const results = await ytSearch(query);
    if (!results || results.videos.length === 0) {
      throw new Error("No se encontraron resultados para tu búsqueda.");
    }

    const video = results.videos[0]; // Tomamos el primer video encontrado
    const videoUrl = video.url;

    // Validar la URL del video
    if (!ytdl.validateURL(videoUrl)) {
      throw new Error("URL de video inválida.");
    }

    // Obtener información del video y filtrar los formatos de audio
    const info = await ytdl.getInfo(videoUrl);
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

    // Buscar un formato MP3
    const mp3Format = audioFormats.find((format) => format.container === "mp3");

    if (!mp3Format) {
      throw new Error("No se encontró un formato de audio MP3.");
    }

    // Retornar la URL de descarga del MP3
    return mp3Format.url;
  } catch (error) {
    throw new Error("No se pudo obtener la URL de descarga: " + error.message);
  }
};

  return {
    args,
    commandName,
    fullArgs,
    fullMessage,
    isReply,
    prefix,
    remoteJid,
    replyJid,
    socket,
    userJid,
    webMessage,
    sendReact,
    sendReply,
    sendSuccessReply,
    sendWaitReply,
    sendErrorReply,
    searchYouTubeMusic, // Exportar función de búsqueda
    getYouTubeDownloadUrl, // Exportar función de descarga
  };
};