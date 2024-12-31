const playdl = require("play-dl");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "música",
  description: "Descarga y envía música desde YouTube",
  commands: ["m", "pp"],
  usage: `${PREFIX}música <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    console.log("Comando música recibido con argumentos:", args);

    if (!args || args.length === 0) {
      await sendReply(`Uso incorrecto. Proporciona el nombre de la canción o URL. Ejemplo: ${PREFIX}música <nombre o URL>`);
      return;
    }

    const query = args.join(" ");
    console.log("Consulta recibida:", query);

    try {
      // Buscar el video
      const searchResult = await playdl.search(query, { limit: 1 });
      console.log("Resultados de búsqueda obtenidos:", searchResult.length);

      if (searchResult.length === 0) {
        console.log("No se encontraron resultados para:", query);
        await sendReply("No se encontró ningún video para la consulta.");
        return;
      }

      const video = searchResult[0];
      console.log(`Video encontrado: ${video.title} - URL: ${video.url}`);

      // Notificar que la música está siendo descargada
      await sendReply(`Descargando música: ${video.title}`);
      console.log("Descargando audio desde URL:", video.url);

      // Obtener el stream de audio
      const stream = await playdl.stream(video.url);
      console.log("Stream inicializado correctamente.");

      // Ruta temporal para guardar el archivo
      const tempFilePath = path.join(require("os").tmpdir(), `${video.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`);
      console.log("Ruta del archivo temporal:", tempFilePath);

      // Crear el stream de escritura
      const writeStream = fs.createWriteStream(tempFilePath);
      console.log("Escribiendo el stream al archivo...");

      // Eventos del stream para depuración
      let totalBytes = 0;

      stream.stream.on("data", (chunk) => {
        totalBytes += chunk.length;
        console.log("Chunk recibido, tamaño:", chunk.length, "Bytes totales acumulados:", totalBytes);
      });

      stream.stream.on("error", (err) => {
        console.error("Error en el stream de descarga:", err);
      });

      writeStream.on("error", (error) => {
        console.error("Error al escribir el archivo:", error);
      });

      writeStream.on("finish", async () => {
        console.log("Escritura finalizada correctamente. Total bytes escritos:", totalBytes);

        // Leer el archivo y enviarlo
        const audioBuffer = fs.readFileSync(tempFilePath);
        console.log("Buffer de audio leído, tamaño:", audioBuffer.length);

        // Enviar el archivo
        await socket.sendMessage(remoteJid, {
          audio: audioBuffer,
          mimetype: "audio/mp3",
          fileName: `${video.title}.mp3`,
        });
        console.log("Audio enviado exitosamente.");

        // Eliminar el archivo temporal
        fs.unlinkSync(tempFilePath);
        console.log("Archivo temporal eliminado:", tempFilePath);
      });

      // Conectar los streams
      stream.stream.pipe(writeStream);
    } catch (error) {
      console.error("Error manejando el comando de música:", error);
      await sendReply("Hubo un error al intentar obtener la música.");
    }
  },
};