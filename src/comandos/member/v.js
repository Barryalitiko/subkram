const { PREFIX } = require("../../krampus");
const { playAudio, playVideo } = require("../../services/ytdl");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "play-video",
  description: "Descarga videos",
  commands: ["video", "v"],
  usage: `${PREFIX}video LOFI Wilmer Roberts`,
  handle: async ({
    sendVideoFromURL,
    args,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    // Comprobamos que se ha dado un argumento para la búsqueda
    if (!args.length) {
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Indicame el video que deseas descargar"
      );
    }

    // Muestra el emoji de espera mientras se procesan los datos
    await sendWaitReact();

    try {
      // Obtener la URL del video de la API
      const data = await playVideo(args[0]);

      if (!data) {
        // Si no se encuentra el video, respondemos con un error
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 video no encontrado");
        return;
      }

      // Si todo sale bien, enviamos el video
      await sendSuccessReact();
      await sendVideoFromURL(data.url);
    } catch (error) {
      // Si ocurre un error, enviamos la respuesta de error
      console.log(error);
      await sendErrorReply(JSON.stringify(error.message));
    }
  },
};