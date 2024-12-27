const ytdl = require("ytdl-core");
const { PREFIX } = require("../../krampus"); // Ajusta la ruta según tu proyecto

module.exports = {
  name: "descargar", // Nombre del comando
  description: "Descarga el audio de un video de YouTube.",
  commands: [`${PREFIX}descargar`, `${PREFIX}download`], // Comandos con prefijo
  usage: `${PREFIX}descargar <link de YouTube>`, // Cómo usar el comando
  handle: async ({ args, sendReply, sendAudioFromURL }) => {
    // Verificar si se proporcionó una URL
    if (!args.length) {
      return await sendReply("⚠️ Por favor, proporciona un enlace de YouTube.");
    }

    const videoUrl = args[0];

    try {
      // Validar URL
      if (!ytdl.validateURL(videoUrl)) {
        return await sendReply("❌ El enlace proporcionado no es válido.");
      }

      // Obtener información y URL del audio
      const info = await ytdl.getInfo(videoUrl);
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

      if (!audioFormats.length) {
        return await sendReply("❌ No se encontraron formatos de audio disponibles.");
      }

      // Obtener la URL del mejor formato disponible
      const audioUrl = audioFormats[0].url;

      // Responder con el audio descargado
      await sendReply("⏳ Procesando y enviando el audio...");
      await sendAudioFromURL(audioUrl); // Enviar audio al usuario

    } catch (error) {
      console.error("Error al descargar el audio:", error);
      await sendReply("❌ Hubo un error al intentar descargar el audio.");
    }
  },
};