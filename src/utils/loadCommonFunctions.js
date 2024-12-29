const { BOT_EMOJI } = require("../krampus");
const { extractDataFromMessage, baileysIs, download } = require(".");
const { waitMessage } = require("./messages");
const ytSearch = require("yt-search");
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
    searchYouTubeMusic // Mantengo la función de búsqueda
  };
};
