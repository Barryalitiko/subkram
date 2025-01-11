const { PREFIX } = require("../../krampus");
const { searchVideo } = require("../../services/ytdl"); // Usamos yt-search internamente en este servicio
const { fetchPlayDlAudio } = require("../../services/audioService");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "play-audio",
  description: "Descargar audio desde YouTube",
  commands: ["play-audio", "w"],
  usage: `${PREFIX}play-audio <nombre del audio>`,
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
      console.log("Buscando video en YouTube para:", args.join(" "));
      const video = await searchVideo(args.join(" ")); // Este servicio usa yt-search
      const videoUrl = video.url;

      console.log(`Video encontrado, URL directa: ${videoUrl}`);
      console.log("Llamando al servicio para obtener el enlace de descarga...");

      // Llamar al servicio para obtener el enlace de descarga
      const audioData = await fetchPlayDlAudio(videoUrl);

      if (!audioData || !audioData.downloadUrl) {
        console.log("Error: No se pudo obtener un enlace de descarga válido.");
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo obtener el audio.");
        return;
      }

      console.log(`Enlace de descarga obtenido: ${audioData.downloadUrl}`);
      await sendSuccessReact();

      // Enviar el audio descargado
      console.log("Enviando el audio...");
      await sendAudioFromURL(audioData.downloadUrl);
      console.log("Audio enviado con éxito.");

      // Enviar detalles adicionales (título y duración)
      await sendErrorReply(
        `🎶 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 🎶\n\n**Título:** ${audioData.title}\n**Duración:** ${audioData.total_duration_in_seconds}s`
      );
    } catch (error) {
      console.error("Error en el manejo del comando:", error.message);
      await sendErrorReply(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud de audio."
      );
    }
  },
};