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

  // Regex para validar URLs de YouTube
  const youtubeRegex = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
  const isValidYoutubeUrl = (url) => youtubeRegex.test(url);

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

  // Función para obtener la URL de descarga de YouTube
  const getYouTubeDownloadUrl = async (videoUrl) => {
    try {
      if (isValidYoutubeUrl(videoUrl)) {
        const info = await ytdl.getInfo(videoUrl);
        const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
        return audioFormats[0]?.url || null; // Retorna la primera URL de audio disponible
      }
      throw new Error("URL de YouTube inválida.");
    } catch (error) {
      throw new Error("No se pudo obtener la URL de descarga.");
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