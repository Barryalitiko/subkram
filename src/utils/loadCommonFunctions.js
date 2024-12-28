const { BOT_EMOJI } = require("../krampus");
const { extractDataFromMessage } = require(".");
const { waitMessage } = require("./messages");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");

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

  // Regex para validar URLs básicas de YouTube
  const basicYoutubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  const isValidYoutubeUrl = (url) => basicYoutubeRegex.test(url);

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

  // Función para obtener información del video y la URL de descarga
  const getYouTubeDownloadUrl = async (videoUrl) => {
    try {
      if (!isValidYoutubeUrl(videoUrl)) {
        throw new Error("URL no válida de YouTube");
      }

      // Obtener información del video
      const info = await ytdl.getInfo(videoUrl);
      console.log("Información del video:", info);

      // Filtrar solo formatos de audio
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      if (!audioFormats.length) {
        throw new Error("No se encontraron formatos de audio disponibles.");
      }

      console.log("Formato elegido:", audioFormats[0]);
      return audioFormats[0].url;
    } catch (error) {
      console.error("Error al obtener la URL de descarga:", error);
      throw new Error(
        "Ocurrió un error al intentar obtener la URL de descarga. Verifica la URL."
      );
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
    searchYouTubeMusic,
    getYouTubeDownloadUrl, // Devuelto como parte de las funciones
  };
};