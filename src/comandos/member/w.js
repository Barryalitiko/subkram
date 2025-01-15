const ytSearch = require("yt-search");
const { downloadVideo } = require("../../services/yt-dlp");
const { PREFIX } = require("../../krampus"); // Prefijo configurable

/**
 * Comando para buscar y descargar un video desde YouTube.
 */
module.exports = {
  name: "descargarvideo",
  description: "Busca un video en YouTube y lo descarga.",
  usage: `${PREFIX}descargarvideo <término de búsqueda>`,
  commands: ["descargarvideo"],
  async handle({ args, sendReply }) {
    console.log("Comando recibido:", { args });

    // Verificar que el usuario haya proporcionado un término de búsqueda
    if (!args || args.length === 0) {
      console.log("Error: No se proporcionó ningún término de búsqueda.");
      return sendReply(`Por favor, proporciona un término de búsqueda. Ejemplo: \`${PREFIX}descargarvideo never gonna give you up\``);
    }

    const searchQuery = args.join(" ");
    console.log(`Término de búsqueda recibido: "${searchQuery}"`);

    sendReply(`🔍 Buscando el video para: *${searchQuery}*...`);

    try {
      // Buscar video en YouTube
      console.log("Realizando búsqueda en YouTube...");
      const searchResults = await ytSearch(searchQuery);
      const video = searchResults.videos[0]; // Tomar el primer resultado relevante

      if (!video) {
        console.log("No se encontró ningún video para el término:", searchQuery);
        return sendReply("❌ No se encontró ningún video relacionado con tu búsqueda.");
      }

      // Mostrar detalles del video encontrado
      console.log("Video encontrado:", {
        title: video.title,
        url: video.url,
        duration: video.timestamp,
        author: video.author.name,
      });

      const videoDetails = `📹 *${video.title}*\nDuración: ${video.timestamp}\nSubido por: ${video.author.name}\n\nDescargando el video...`;
      sendReply(videoDetails);

      // Descargar el video usando la URL encontrada
      console.log("Iniciando descarga del video:", video.url);
      const downloadedPath = await downloadVideo(video.url);
      console.log("Descarga completada. Ruta del archivo:", downloadedPath);

      sendReply("✅ Video descargado exitosamente. Enviando archivo...");

      // Enviar el archivo descargado al usuario
      sendReply(
        { text: "Aquí tienes tu video:" },
        { file: downloadedPath, filename: `${video.title}.mp4` }
      );
      console.log("Archivo enviado al usuario:", downloadedPath);
    } catch (error) {
      console.error("Error durante la ejecución del comando:", error);
      sendReply("❌ Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.");
    }
  },
};