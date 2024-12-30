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
    return await socket.sendMessage(
      remoteJid,
      {
        audio: { url },
        mimetype: "audio/mpeg",
      },
      { quoted: webMessage }
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

  // Función para descargar audio de YouTube usando play-dl
  const downloadYouTubeAudio = async (url, filePath) => {
    try {
      const stream = await playdl.stream(url);
      const writeStream = fs.createWriteStream(filePath);
      stream.stream.pipe(writeStream);
      return new Promise((resolve, reject) => {
        writeStream.on("finish", () => resolve(filePath));
        writeStream.on("error", (err) => reject(err));
      });
    } catch (error) {
      throw new Error("Error al descargar audio de YouTube.");
    }
  };

  // Función para buscar y enviar música al usuario
  const sendYouTubeMusic = async (query) => {
    try {
      await sendWaitReply("Buscando tu canción...");
      const video = await searchYouTubeMusic(query);

      if (!video || !video.url) {
        return await sendErrorReply("No se pudo encontrar la música.");
      }

      const filePath = `./temp/${video.title}.mp3`;
      await sendWaitReply("Descargando tu canción...");
      await downloadYouTubeAudio(video.url, filePath);

      await sendSuccessReply("¡Aquí está tu canción!");
      return await socket.sendMessage(
        remoteJid,
        {
          audio: fs.readFileSync(filePath),
          mimetype: "audio/mpeg",
        },
        { quoted: webMessage }
      );
    } catch (error) {
      return await sendErrorReply("Error al enviar la música.");
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
    socket,
    userJid,
    webMessage,
    sendReact,
    sendReply,
    sendAudioFromURL,
    sendYouTubeMusic,
  };
};
