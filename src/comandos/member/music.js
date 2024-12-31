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
    console.log("Comando recibido. Argumentos:", args);

    const query = args.join(" ");
    if (!query) {
      await sendReply("Por favor, proporciona el nombre o URL del video.");
      return;
    }

    console.log("Consulta de búsqueda:", query);

    try {
      // Buscar el video
      const searchResult = await playdl.search(query, { limit: 1 });
      if (searchResult.length === 0) {
        console.log("Sin resultados para la consulta:", query);
        await sendReply("No se encontró ningún video para la consulta.");
        return;
      }

      const video = searchResult[0];
      console.log("Video encontrado:", video);

      // Notificar inicio de descarga
      await sendReply(`Iniciando la descarga de: ${video.title}`);
      console.log("Descargando audio desde URL:", video.url);

      // Obtener el stream
      const stream = await playdl.stream(video.url);
      if (!stream) {
        console.error("No se pudo obtener el stream del video.");
        await sendReply("Error al intentar obtener el audio del video.");
        return;
      }
      console.log("Stream inicializado correctamente.");

      // Archivo temporal
      const tempFilePath = path.join(__dirname, `${video.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`);
      console.log("Ruta del archivo temporal:", tempFilePath);

      const writeStream = fs.createWriteStream(tempFilePath);
      console.log("Escribiendo el stream al archivo...");

      // Validación de chunks
      let totalBytes = 0;
      stream.stream.on("data", (chunk) => {
        totalBytes += chunk.length;
        console.log("Chunk recibido, tamaño:", chunk.length, "Bytes totales:", totalBytes);
      });

      // Manejar errores del stream
      stream.stream.on("error", (err) => {
        console.error("Error en el stream de descarga:", err);
        writeStream.destroy(); // Detener escritura
      });

      // Escribir el stream al archivo
      stream.stream.pipe(writeStream);

      // Esperar que termine de escribir
      await new Promise((resolve, reject) => {
        writeStream.on("finish", () => {
          console.log("Escritura del archivo completada. Total Bytes:", totalBytes);
          resolve();
        });
        writeStream.on("error", (error) => {
          console.error("Error al escribir el archivo:", error);
          reject(error);
        });
      });

      // Confirmar existencia y tamaño del archivo
      if (!fs.existsSync(tempFilePath)) {
        console.error("Archivo no encontrado tras la escritura:", tempFilePath);
        await sendReply("Error: No se pudo generar el archivo de audio.");
        return;
      }

      const stats = fs.statSync(tempFilePath);
      console.log("Tamaño del archivo generado:", stats.size);
      if (stats.size === 0) {
        console.error("Archivo generado está vacío:", tempFilePath);
        await sendReply("Error: El archivo generado está vacío.");
        return;
      }

      // Leer el archivo y enviarlo
      const audioBuffer = fs.readFileSync(tempFilePath);
      console.log("Buffer de audio leído. Tamaño del buffer:", audioBuffer.length);

      console.log("Enviando archivo a Baileys...");
      const message = await socket.sendMessage(remoteJid, {
        audio: { url: tempFilePath },
        mimetype: "audio/mp3",
        ptt: false,
      });

      console.log("Mensaje enviado con Baileys:", message);

      // Eliminar archivo temporal
      fs.unlinkSync(tempFilePath);
      console.log("Archivo temporal eliminado:", tempFilePath);

      // Confirmación al usuario
      await sendReply(`Música enviada: ${video.title}`);
    } catch (error) {
      console.error("Error durante el manejo del comando de música:", error);
      await sendReply("Ocurrió un error al procesar la solicitud.");
    }
  },
};