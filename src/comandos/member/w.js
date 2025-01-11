const { PREFIX } = require("../../krampus");
const { getAudioDownloadLink } = require("../../services/audioService"); // Importamos el servicio
const ytSearch = require("yt-search"); // Importamos yt-search
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "audio",
  description: "Descargar solo el audio de un video de YouTube",
  commands: ["audio", "w"],
  usage: `${PREFIX}audio LOFI Wilmer Roberts`,
  handle: async ({
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sendAudioFromURL,
    args,
  }) => {
    if (!args.length) {
      console.log("Error: No se proporcionaron argumentos.");
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Indicame el video o la canción que deseas descargar"
      );
    }

    console.log(`Comando recibido con argumentos: ${args.join(" ")}`);
    await sendWaitReact();

    try {
      // Buscar el video en YouTube con el término proporcionado
      const query = args.join(" ");
      console.log(`Buscando video en YouTube para: ${query}`);

      const videoResults = await ytSearch(query);
      if (!videoResults || !videoResults.videos.length) {
        console.log("No se encontró un video válido.");
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo encontrar un video válido.");
        return;
      }

      // Obtener el primer video de los resultados
      const video = videoResults.videos[0];
      const videoUrlDirect = video.url;

      console.log(`Video encontrado, URL directa: ${videoUrlDirect}`);

      // Llamar al servicio para obtener el enlace de descarga
      console.log("Llamando al servicio para obtener el enlace de descarga...");
      const downloadUrl = await getAudioDownloadLink(videoUrlDirect);

      if (!downloadUrl) {
        console.log("Error: No se pudo obtener un enlace de descarga válido.");
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo obtener el audio");
        return;
      }

      console.log(`Enlace de descarga obtenido: ${downloadUrl}`);

      // Enviar el audio usando el enlace de descarga
      console.log("Enviando el audio...");
      await sendAudioFromURL(downloadUrl);
      console.log("Audio enviado con éxito.");

      // Responder con éxito
      await sendSuccessReact();
      console.log("Comando procesado correctamente.");

    } catch (error) {
      console.log("Error en el manejo del comando:", error.message);
      await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud.");
    }
  },
};