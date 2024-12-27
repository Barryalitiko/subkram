const { BOT_EMOJI } = require("../krampus");
const { extractDataFromMessage, baileyIs } = require(".");
const { waitMessage } = require("./messages");
const youtubeSearch = require("youtube-search-api"); // Importar biblioteca de búsqueda
const ytdl = require("ytdl-core"); // Importar biblioteca de descarga

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
    return await sendReply(`❌ Erro! ${text}`);
  };

  // Función para buscar música en YouTube
  const searchYouTubeMusic = async (query) => {
    try {
      const results = await youtubeSearch.GetListByKeyword(query, false, 1);
      return results.items[0]; // Retorna el primer resultado
    } catch (error) {
      throw new Error("No se pudo buscar la música en YouTube.");
    }
  };

  // Función para obtener la URL de descarga de YouTube
  const getYouTubeDownloadUrl = (videoUrl) => {
    try {
      if (ytdl.validateURL(videoUrl)) {
        const info = ytdl.getInfo(videoUrl);
        const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
        return audioFormats[0]?.url; // Retorna la primera URL de audio disponible
      }
      throw new Error("URL de video inválida.");
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
