const playdl = require("play-dl");

module.exports = {
  // Función para descargar audio de YouTube
  downloadAudio: async (url) => {
    try {
      // Usamos play-dl para obtener el audio del video
      const audioStream = await playdl.stream(url);
      const audioBuffer = await audioStream.buffer(); // Método correcto de play-dl

      return audioBuffer; // Retorna el buffer de audio
    } catch (error) {
      console.error(`Error al descargar el audio: ${error}`);
      throw new Error("No se pudo descargar el audio.");
    }
  }
};