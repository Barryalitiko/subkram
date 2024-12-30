const playdl = require("play-dl");
const fs = require("fs");

(async () => {
  try {
    console.log("Probando conexión a YouTube...");
    const searchResult = await playdl.search("Luis Fonsi - Despacito", { limit: 1 });

    if (searchResult.length === 0) {
      console.log("No se encontró ningún resultado.");
      return;
    }

    const video = searchResult[0];
    console.log("Video encontrado:", video);

    console.log("Iniciando el streaming para:", video.title);
    const streamInfo = await playdl.stream(video.url);
    console.log("Stream de audio obtenido:", streamInfo);

    console.log("Convirtiendo el stream a buffer...");
    
    // Usamos setTimeout para extender el tiempo de espera
    const audioBuffer = await timeoutPromise(streamToBuffer(streamInfo.stream), 30000); // Timeout de 30 segundos
    console.log("Buffer generado, tamaño:", audioBuffer.length);

    // Guardar el buffer en un archivo temporal
    const tempFilePath = "temp_audio.mp3";
    console.log("Guardando el buffer en un archivo temporal:", tempFilePath);
    fs.writeFileSync(tempFilePath, audioBuffer);
    
    console.log("Archivo guardado correctamente. Revisa el archivo:", tempFilePath);
  } catch (error) {
    console.error("Error durante el test:", error);
  }
})();

// Función para convertir stream a buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => {
      console.log("Chunk recibido:", chunk.length, "bytes");
      chunks.push(chunk);
    });
    stream.on("end", () => {
      console.log("Stream completado, generando buffer...");
      resolve(Buffer.concat(chunks));
    });
    stream.on("error", (error) => {
      console.error("Error en el stream:", error);
      reject(error);
    });
  });
}

// Función para añadir un timeout a cualquier promesa
function timeoutPromise(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Operación excedió el tiempo límite')), ms);
    promise.then((result) => {
      clearTimeout(timer);
      resolve(result);
    }).catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}