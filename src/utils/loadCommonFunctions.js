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

  // Función para obtener la URL de descarga de YouTube
  const getYouTubeDownloadUrl = async (videoUrl) => {
    try {
      if (!ytdl.validateURL(videoUrl)) {
        throw new Error("URL de video inválida.");
      }

      // Descargar el audio como stream
      const audioStream = ytdl(videoUrl, { filter: "audioonly" });

      // Convertimos el stream a un buffer
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks); // Retorna el buffer del audio
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