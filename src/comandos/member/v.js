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
      console.log("Error: No se proporcionaron argumentos.");
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Indicame el video que deseas descargar"
      );
    }

    console.log(`Comando recibido con argumentos: ${args.join(" ")}`);
    await sendWaitReact();

    try {
      // Buscar el video en YouTube con el término proporcionado
      console.log("Iniciando búsqueda del video en YouTube...");
      const video = await searchVideo(args.join(" "));
      const videoUrl = video.url;

      console.log(`Video encontrado: ${video.title} (${video.url})`);

      // Obtener el enlace de descarga del video usando la API
      console.log(`Llamando a la API para obtener el enlace de descarga del video: ${videoUrl}`);
      const videoData = await fetchFromApi("video", videoUrl);

      if (!videoData || !videoData.downloadUrl) {
        console.log("Error: No se pudo obtener un enlace de descarga válido.");
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo obtener el video");
        return;
      }

      console.log(`Enlace de descarga obtenido: ${videoData.downloadUrl}`);
      await sendSuccessReact();

      // Enviar el video descargado
      console.log("Enviando el video...");
      await sendVideoFromURL(videoData.downloadUrl);
      console.log("Video enviado con éxito.");

    } catch (error) {
      console.log("Error en el manejo del comando:", error.message);
      await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud.");
    }
  },
};