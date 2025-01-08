const { PREFIX } = require("../../krampus");
const { searchVideo, fetchFromApi } = require("../../services/ytdl");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "video",
  description: "Descargar video desde YouTube",
  commands: ["video", "v"],
  usage: `${PREFIX}video LOFI Wilmer Roberts`,
  handle: async ({
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sendVideoFromURL,
    args,
  }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Indicame el video que deseas descargar"
      );
    }

    await sendWaitReact();

    try {
      // Buscar el video en YouTube con el término proporcionado
      const video = await searchVideo(args.join(" "));
      const videoUrl = video.url;

      console.log(`Video encontrado: ${video.title} (${video.url})`);

      // Obtener el enlace de descarga del video usando la API
      const videoData = await fetchFromApi("video", videoUrl);

      if (!videoData || !videoData.downloadUrl) {
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo obtener el video");
        return;
      }

      await sendSuccessReact();
      await sendVideoFromURL(videoData.downloadUrl);  // Enviar el video

    } catch (error) {
      console.log(error);
      await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud.");
    }
  },
};