const { PREFIX } = require("../../krampus");
const ytSearch = require("yt-search");
// Importa correctamente la función downloadAudio desde la ruta correcta
const { downloadAudio } = require("../play-handler/downloadAudio");

module.exports = {
  name: 'musica',
  description: 'Busca y envía música desde YouTube',
  commands: ['musica', 'play'],
  usage: `${PREFIX}musica <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (args.length < 1) {
      console.log("Uso incorrecto. No se proporcionó nombre de canción o URL.");
      await sendReply(`Uso incorrecto. Por favor, proporciona el nombre de la canción o el URL. Ejemplo: ${PREFIX}musica [nombre o URL]`);
      return;
    }

    const query = args.join(" ");
    console.log(`Buscando música para: ${query}`);

    try {
      // Buscar música en YouTube usando yt-search
      console.log(`Iniciando búsqueda en YouTube para: ${query}`);
      const results = await ytSearch(query);
      
      if (!results || results.videos.length === 0) {
        console.log("No se encontraron resultados para la búsqueda.");
        return await sendReply("No se encontraron resultados para la búsqueda.");
      }

      // Obtener el primer resultado de video
      const video = results.videos[0];
      console.log(`Encontrado: ${video.title} - ${video.url}`);

      // Descargar el audio del video
      console.log(`Iniciando descarga del audio de: ${video.url}`);
      const audioBuffer = await downloadAudio(video.url);
      console.log(`Audio descargado con éxito, tamaño: ${audioBuffer.length} bytes`);

      // Enviar el audio al usuario
      console.log(`Enviando audio a: ${remoteJid}`);
      await socket.sendMessage(remoteJid, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        caption: `🎶 Aquí tienes: ${video.title}`,
      });

      console.log(`Audio enviado con éxito: ${video.title}`);
    } catch (error) {
      console.error(`Error al buscar o descargar el audio: ${error}`);
      await sendReply("Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
    }
  },
};