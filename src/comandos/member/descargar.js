const { PREFIX } = require("../../krampus");
const { getYouTubeDownloadUrl } = require("../../services/loadCommonFunctions");

module.exports = {
  name: "download",
  description: "Descargar música desde YouTube",
  commands: ["download", "music", "play"],
  usage: `${PREFIX}download <URL de YouTube>`,
  handle: async ({ args, sendWaitReact, sendSuccessReact, sendErrorReply }) => {
    if (!args.length) {
      return sendErrorReply(`👻 ${PREFIX}download Debes proporcionar una URL válida de YouTube.`);
    }

    const url = args[0];

    try {
      // Llamamos a la función para obtener la URL de descarga
      const downloadUrl = await getYouTubeDownloadUrl(url);

      await sendWaitReact();
      await sendSuccessReact();

      return sendErrorReply(`🔊 Aquí está el enlace de descarga: ${downloadUrl}`);
    } catch (error) {
      return sendErrorReply(`❌ Error: ${error.message}`);
    }
  },
};