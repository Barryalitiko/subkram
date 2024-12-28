const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "download",
  description: "Descarga música desde YouTube.",
  commands: ["download", "music", "play"],
  usage: `${PREFIX}download <URL de YouTube>`,
  handle: async ({
    args,
    sendWaitReply,
    sendSuccessReply,
    sendErrorReply,
    remoteJid,
    socket,
  }) => {
    if (!args.length) {
      return sendErrorReply(
        `👻 Proporciona una URL válida de YouTube. Uso: ${PREFIX}download <URL>`
      );
    }

    const videoUrl = args[0];

    // Validar si la URL es válida
    if (!ytdl.validateURL(videoUrl)) {
      return sendErrorReply("❌ La URL proporcionada no es válida.");
    }

    try {
      // Indicar que se está procesando la solicitud
      await sendWaitReply("Descargando la canción, por favor espera...");

      // Obtener información del video
      const info = await ytdl.getInfo(videoUrl);
      const title = info.videoDetails.title.replace(/[^\w\s]/gi, ""); // Limpiar título

      // Descargar el audio directamente sin escribir en disco
      const stream = ytdl(videoUrl, { filter: "audioonly", quality: "highestaudio" });

      // Enviar el audio directamente al grupo sin guardarlo en disco
      await socket.sendMessage(remoteJid, {
        audio: stream,
        mimetype: "audio/mpeg",
      });

      await sendSuccessReply(`✅ Descarga completada y enviada: ${title}`);
    } catch (error) {
      console.error(error);
      return sendErrorReply(`❌ Error: ${error.message}`);
    }
  },
};
