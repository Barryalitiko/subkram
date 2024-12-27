const ytdl = require("ytdl-core");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "descargar",
  description: "Descarga el audio de un video de YouTube.",
  commands: [`${PREFIX}descargar`, `${PREFIX}download`],
  usage: `${PREFIX}descargar <link de YouTube>`,
  handle: async ({ args, sendReply, sendAudioFromURL }) => {
    console.log("Argumentos recibidos:", args); // Verifica los argumentos

    if (!args.length) {
      return await sendReply("⚠️ Por favor, proporciona un enlace de YouTube.");
    }

    const videoUrl = args[0];
    console.log("URL recibida:", videoUrl); // Verifica la URL proporcionada

    try {
      // Validar URL
      if (!ytdl.validateURL(videoUrl)) {
        console.log("URL inválida:", videoUrl); // Log para URL inválida
        return await sendReply("❌ El enlace proporcionado no es válido.");
      }

      // Obtener información y URL del audio
      const info = await ytdl.getInfo(videoUrl);
      console.log("Información del video:", info); // Log para información del video

      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      console.log("Formatos de audio disponibles:", audioFormats); // Log para formatos

      if (!audioFormats.length) {
        return await sendReply("❌ No se encontraron formatos de audio disponibles.");
      }

      // Obtener la URL del mejor formato disponible
      const audioUrl = audioFormats[0].url;
      console.log("URL de descarga:", audioUrl); // Log para la URL de descarga

      // Responder con el audio descargado
      await sendReply("⏳ Procesando y enviando el audio...");
      await sendAudioFromURL(audioUrl);

    } catch (error) {
      console.error("Error al descargar el audio:", error);
      await sendReply("❌ Hubo un error al intentar descargar el audio.");
    }
  },
};