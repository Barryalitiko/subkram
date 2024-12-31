const playdl = require("play-dl");

module.exports = {
  // Función para obtener el enlace de descarga de música
  getAudioURL: async (query) => {
    try {
      // Realiza la búsqueda y limita los resultados a 1
      const searchResult = await playdl.search(query, { limit: 1 });

      // Si no se encuentran resultados, devuelve un error
      if (searchResult.length === 0) {
        throw new Error("No se encontró música para la búsqueda.");
      }

      // Obtiene el primer video de los resultados
      const video = searchResult[0];

      // Devuelve el enlace de la descarga del audio
      const stream = await playdl.stream(video.url);
      return stream.url;  // Aquí nos da la URL directa del audio
    } catch (error) {
      console.error("Error obteniendo la música:", error);
      throw error;
    }
  }
};