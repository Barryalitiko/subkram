const { BOT_EMOJI } = require("../krampus");
const { extractDataFromMessage, baileysIs, download } = require(".");
const { waitMessage } = require("./messages");
const ytSearch = require("yt-search");
const playdl = require("play-dl");
const fs = require("fs");

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

  const sendText = async (text, mentions) => {
    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(remoteJid, {
      text: `${BOT_EMOJI} ${text}`,
      ...optionalParams,
    });
  };
  
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

  const sendSuccessReact = async () => {
    return await sendReact("✅");
  };

  const sendWarningReply = async (text) => {
    await sendWarningReact();
    return await sendReply(`⚠️ Advertencia! ${text}`);
  };

  const sendWarningReact = async () => {
    return await sendReact("⚠️");
  };
  
  const sendWaitReact = async () => {
    return await sendReact("⏳");
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

  const sendErrorReply = async (text) => {
    await sendErrorReact();
    return await sendReply(`☠ Error! ${text}`);
  };

  const sendAudioFromURL = async (url) => {
  try {
    console.log(`Enviando audio desde URL: ${url}`);
    return await socket.sendMessage(
      remoteJid,
      {
        audio: { url },
        mimetype: "audio/mpeg",
      },
      { quoted: webMessage }
    );
  } catch (error) {
    console.error("Error al enviar el audio:", error);
    throw new Error("No se pudo enviar el audio.");
  }
};

    const sendVideoFromURL = async (url) => {
  console.log(`Enviando video desde URL: ${url}`); // Registro del URL
  return await socket.sendMessage(
    remoteJid,
    {
      video: { url },
    },
    { quoted: webMessage }
  );
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
  
  const sendMessage = async ({ messageType, caption = '', mimetype = '', url = '' }) => {
  try {
    let messageContent = {};
    
    if (messageType === 'audio') {
      messageContent = { audio: { url }, mimetype };
    } else if (messageType === 'video') {
      messageContent = { video: { url }, caption, mimetype };
    } else if (messageType === 'image') {
      messageContent = { image: { url }, caption, mimetype };
    }

    await socket.sendMessage(remoteJid, messageContent, { quoted: webMessage });
    console.log(`${messageType} enviado con éxito.`);
  } catch (error) {
    console.error(`Error al enviar el mensaje de tipo ${messageType}:`, error);
  }
};
  
  return {
    args,
    commandName,
    fullArgs,
    fullMessage,
    isReply,
    isSticker,
    isVideo,
    prefix,
    remoteJid,
    replyJid,
    sendAudioFromURL,
    sendErrorReply,
    sendErrorReact,
    sendStickerFromFile,
    sendStickerFromURL,
    sendSuccessReact,
    sendSuccessReply,
    sendText,
    sendVideoFromURL,
    sendWarningReact,
    sendWaitReact,
    sendWaitReply,
    sendMessage,
    socket,
    userJid,
    webMessage,
    sendReact,
    sendReply,
    sendWarningReply,
    sendAudioFromURL,
  };
};
