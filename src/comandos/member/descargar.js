const { PREFIX } = require("../../krampus");
const { getYouTubeDownloadUrl } = require("../../services/loadCommonFunctions");

module.exports = {
  name: "download",
  description: "Descargar música desde YouTube",
  commands: ["download", "music", "play"],
  usage: `${PREFIX}download <URL de YouTube>`,
  handle: async ({
    args,
    sendWaitReply,
    sendSuccessReply,
    sendErrorReply,
    sendReact,
  }) => {
    if (!args.length) {
      return sendErrorReply(
        `👻 Debes proporcionar una URL válida de YouTube. Uso: ${PREFIX}download <URL>`
      );
    }

    const url = args[0];

    try {
      // Agregar reacción de espera
      await sendReact("⏳");

      // Llamamos a la función para obtener la URL de descarga
      const downloadUrl = await getYouTubeDownloadUrl(url);

      if (!downloadUrl) {
        return sendErrorReply("❌ No se pudo encontrar un enlace de descarga.");
      }

      // Respuesta de éxito con la URL de descarga
      await sendReact("✅");
      return sendSuccessReply(`🔊 Aquí está el enlace de descarga: ${downloadUrl}`);
    } catch (error) {
      return sendErrorReply(`❌ Error: ${error.message}`);
    }
  },
};