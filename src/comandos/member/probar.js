// Importar la función de descarga de video
const { downloadMedia } = require("../services/prueba");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "video",  // Nombre del comando
  description: "Comando para descargar solo videos desde YouTube",
  commands: ["descargar-video", "yt-video"],  // Comandos asociados
  usage: `${PREFIX}descargar-video <video_name>`,
  cooldown: 120,  // 2 minutos de cooldown
  handle: async ({ args, sendReply, sendReact }) => {
    // Verificar si el comando tiene los parámetros necesarios
    if (args.length < 1) {
      await sendReply(`Uso incorrecto. Ejemplo: ${PREFIX}descargar-video Never Gonna Give You Up`);
      console.log("[VIDEO] Error: Parámetros insuficientes.");
      return;
    }

    const videoQuery = args[0];  // La consulta de búsqueda (nombre del video)
    console.log(`[VIDEO] Iniciando búsqueda de video: ${videoQuery}`);

    try {
      await sendReact("⏳");

      // Llamar a la función para buscar y descargar el video
      console.log(`[VIDEO] Buscando y descargando video: ${videoQuery}`);
      await downloadMedia(videoQuery, 'video');  // Solo video

      await sendReply(`Descargando video de: ${videoQuery}`);
      console.log(`[VIDEO] Video descargado exitosamente: ${videoQuery}`);
    } catch (error) {
      console.error("[VIDEO] Error al ejecutar el comando:", error);
      await sendReply("Hubo un error al procesar tu solicitud.");
    }
  }
};