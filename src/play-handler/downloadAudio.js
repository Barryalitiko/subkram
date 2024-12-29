const playdl = require("play-dl");

module.exports = {
  downloadAudio: async (url) => {
    try {
      console.log(`Iniciando la descarga del audio desde: ${url}`);
      const audioBuffer = await playdl.streamToBuffer(url);
      console.log(`Audio descargado con éxito. Buffer size: ${audioBuffer.length} bytes`);
      return audioBuffer;
    } catch (error) {
      console.error(`Error al descargar el audio desde ${url}: ${error}`);
      throw new Error("No se pudo descargar el audio.");
    }
  }
};
