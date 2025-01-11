const { PREFIX } = require("../../krampus");
const { fetchPlayDlVideo } = require("../../services/audioService"); // Ahora importamos fetchPlayDlVideo
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "play-video",
  description: "Descargar video desde YouTube",
  commands: ["play-video", "video"],
  usage: `${PREFIX}play-video <nombre del video>`,
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
      console.log("Buscando video en YouTube para:", args.join(" "));
      const video = await searchVideo(args.join(" ")); // Este servicio usa yt-search
      const videoUrl = video.url;

      console.log(`Video encontrado, URL directa: ${videoUrl}`);
      console.log("Llamando al servicio para obtener el enlace de descarga...");

      // Llamar al servicio para obtener el enlace de descarga
      const videoData = await fetchPlayDlVideo(videoUrl);

      if (!videoData || !videoData.downloadUrl) {
        console.log("Error: No se pudo obtener un enlace de descarga válido.");
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo obtener el video.");
        return;
      }

      console.log(`Enlace de descarga obtenido: ${videoData.downloadUrl}`);
      await sendSuccessReact();

      // Enviar el video descargado
      console.log("Enviando el video...");
      await sendVideoFromURL(videoData.downloadUrl);
      console.log("Video enviado con éxito.");
    } catch (error) {
      console.error("Error en el manejo del comando:", error.message);
      await sendErrorReply(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud de video."
      );
    }
  },
};