const { BOT_EMOJI } = require("../krampus");
const { extractDataFromMessage, baileysIs, download } = require(".");
const { waitMessage } = require("./messages");
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

  // Detección de tipos de medios
  const isImage = baileysIs(webMessage, "image");
  const isVideo = baileysIs(webMessage, "video");
  const isSticker = baileysIs(webMessage, "sticker");

  // Funciones para descargar los archivos según el tipo
  const downloadImage = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "image", "png");
  };

  const downloadSticker = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "sticker", "webp");
  };

  const downloadVideo = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "video", "mp4");
  };

  // Función para enviar el mensaje adecuado basado en el tipo de archivo
  const sendMediaMessage = async (file, messageType) => {
    let messageContent = {};

    if (messageType === 'audio') {
      messageContent = { audio: { url: file }, mimetype: 'audio/mpeg' };
    } else if (messageType === 'video') {
      messageContent = { video: { url: file }, mimetype: 'video/mp4' };
    } else if (messageType === 'image') {
      messageContent = { image: { url: file }, mimetype: 'image/png' };
    }

    await socket.sendMessage(remoteJid, messageContent, { quoted: webMessage });
  };

  // Función para manejar y enviar los mensajes según el tipo de contenido
  const handleMediaMessage = async () => {
    if (isImage) {
      console.log("Imagen detectada. Enviando imagen...");
      const imageUrl = await downloadImage(webMessage, 'image');  // Cambia el nombre del archivo si es necesario
      await sendMediaMessage(imageUrl, 'image');
    } else if (isVideo) {
      console.log("Video detectado. Enviando video...");
      const videoUrl = await downloadVideo(webMessage, 'video');  // Cambia el nombre del archivo si es necesario
      await sendMediaMessage(videoUrl, 'video');
    } else if (isSticker) {
      console.log("Sticker detectado. Enviando sticker...");
      const stickerUrl = await downloadSticker(webMessage, 'sticker');  // Cambia el nombre del archivo si es necesario
      await sendMediaMessage(stickerUrl, 'sticker');
    } else {
      console.log("No se detectó imagen, video ni sticker.");
    }
  };

  // Llamamos a la función que maneja los medios recibidos
  handleMediaMessage();

  // Funciones para enviar textos y respuestas
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

  // Función para enviar respuesta a un mensaje
  const sendReply = async (text) => {
    return await socket.sendMessage(
      remoteJid,
      { text: `${BOT_EMOJI} ${text}` },
      { quoted: webMessage }
    );
  };

  // Función para enviar reacciones
  const sendReact = async (emoji) => {
    return await socket.sendMessage(remoteJid, {
      react: {
        text: emoji,
        key: webMessage.key,
      },
    });
  };

  // Funciones para reacciones comunes
  const sendSuccessReact = async () => {
    return await sendReact("✅");
  };

  const sendMusicReact = async () => {
    return await sendReact("🎵");
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

  const sendVideoFromFile = async (filePath, caption = '') => {
    console.log(`Enviando video desde archivo: ${filePath}`); // Registro de la ruta local
    return await socket.sendMessage(
      remoteJid,
      {
        video: fs.readFileSync(filePath), // Le pasas el archivo leído desde el sistema local
        caption: caption, // Añadir un pie de foto, si lo deseas
      },
      { quoted: webMessage }
    );
  };

  return {
    args,
    commandName,
    downloadImage,
    downloadSticker,
    downloadVideo,
    fullArgs,
    fullMessage,
    isReply,
    isSticker,
    isVideo,
    prefix,
    remoteJid,
    replyJid,
    sendText,
    sendReply,
    sendMediaMessage,  // Añadido para el envío de medios
    socket,
    userJid,
    webMessage,
    sendReact,
  };
};