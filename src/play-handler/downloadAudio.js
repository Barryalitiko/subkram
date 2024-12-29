const playdl = require("play-dl");

module.exports = {
  downloadAudio: async (url) => {
    try {
      console.log(`Iniciando la descarga del audio desde: ${url}`);
      
      // Obtener el flujo de audio desde play-dl
      const audioStream = await playdl.stream(url);
      
      // El audioStream tiene un objeto 'stream' que es un flujo legible
      const audioBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        audioStream.stream.on('data', chunk => chunks.push(chunk));
        audioStream.stream.on('end', () => resolve(Buffer.concat(chunks)));
        audioStream.stream.on('error', reject);
      });

      console.log(`Audio descargado con éxito. Buffer size: ${audioBuffer.length} bytes`);
      return audioBuffer; // Retorna el buffer de audio
    } catch (error) {
      console.error(`Error al descargar el audio desde ${url}: ${error}`);
      throw new Error("No se pudo descargar el audio.");
    }
  }
};