const { PREFIX } = require("../../krampus");
const { searchVideo, fetchFromApi } = require("../../services/ytdl");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "audio",
  description: "Descargar audio desde YouTube",
  commands: ["audio", "a"],
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
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Indicame el audio que deseas descargar"
      );
    }

    console.log(`Comando recibido con argumentos: ${args.join(" ")}`);
    await sendWaitReact();

    try {
      // Buscar el video en YouTube con el término proporcionado
      console.log("Iniciando búsqueda del audio en YouTube...");
      const video = await searchVideo(args.join(" "));
      const videoUrl = video.url;

      console.log(`Video encontrado: ${video.title} (${video.url})`);

      // Obtener el enlace de descarga del audio usando la API
      console.log(`Llamando a la API para obtener el enlace de descarga del audio: ${videoUrl}`);
      const audioData = await fetchFromApi("audio", videoUrl);

      if (!audioData || !audioData.downloadUrl) {
        console.log("Error: No se pudo obtener un enlace de descarga válido.");
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo obtener el audio");
        return;
      }

      console.log(`Enlace de descarga obtenido: ${audioData.downloadUrl}`);
      await sendSuccessReact();

      // Enviar el audio descargado
      console.log("Enviando el audio...");
      await sendAudioFromURL(audioData.downloadUrl);
      console.log("Audio enviado con éxito.");

    } catch (error) {
      console.log("Error en el manejo del comando:", error.message);
      await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud.");
    }
  },
};