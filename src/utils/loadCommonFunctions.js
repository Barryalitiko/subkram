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

  // Función para buscar y obtener la URL de descarga
  const searchAndDownload = async (query) => {
    try {
      const results = await ytSearch(query);
      if (results && results.videos.length > 0) {
        const video = results.videos[0]; // Tomar el primer video
        const videoTitle = video.title;
        const videoUrl = video.url;

        if (!ytdl.validateURL(videoUrl)) {
          throw new Error("URL de video inválida.");
        }

        const info = await ytdl.getInfo(videoUrl);
        const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

        const mp3Format = audioFormats.find((format) => format.container === "mp3");

        if (!mp3Format) {
          throw new Error("No se encontró un formato de audio MP3.");
        }

        return mp3Format.url; // Retorna la URL de descarga
      } else {
        throw new Error("No se encontraron resultados para la búsqueda.");
      }
    } catch (error) {
      throw new Error("No se pudo obtener la URL de descarga.");
    }
  };

  // Función para enviar el audio usando la URL
  const sendAudioFromURL = async (audioUrl) => {
    return await socket.sendMessage(
      remoteJid,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: "audio.mp3",
      },
      { quoted: webMessage }
    );
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
    searchAndDownload,
    sendAudioFromURL,
  };
};