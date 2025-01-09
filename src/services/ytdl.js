const axios = require("axios");
const ytSearch = require("yt-search");
const { BASE_API_URL } = require("../krampus"); // Importar la URL base de la API

// Función para buscar un video en YouTube
async function searchVideo(query) {
  console.log(`Buscando video con query: ${query}`);
  const results = await ytSearch(query);
  if (results.videos.length === 0) {
    throw new Error("No se encontraron resultados");
  }
  console.log(`Resultados de búsqueda: ${results.videos.map(v => v.title).join(", ")}`);
  return results.videos[0]; // Retorna el primer video encontrado
}

// Función para procesar audio o video con la API
async function fetchFromApi(endpoint, url) {
  console.log(`Llamando a la API: ${BASE_API_URL}/${endpoint} con URL: ${url}`);
  try {
    const response = await axios.get(`${BASE_API_URL}/${endpoint}`, {
      params: { url },
    });
    console.log(`Respuesta de la API (${endpoint}):`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error en la llamada a la API (${endpoint}):`, error.response?.data || error.message);
    throw new Error(
      `Error al obtener datos desde la API (${endpoint}): ${error.message}`
    );
  }
}

// Exportar las funciones para poder ser utilizadas en otros módulos
exports.searchVideo = searchVideo;
exports.fetchFromApi = fetchFromApi;

// Comando del bot
exports.handleCommand = async (args) => {
  const query = args.join(" ");
  let videoUrl;

  try {
    if (query.startsWith("http")) {
      // Caso: El usuario proporciona un enlace directo
      videoUrl = query;
      console.log(`El usuario proporcionó una URL directa: ${videoUrl}`);
    } else {
      // Caso: El usuario proporciona un término de búsqueda
      const video = await searchVideo(query);
      videoUrl = video.url;
      console.log(`Video encontrado: ${video.title} (${video.url})`);
    }

    // Usar la API para obtener los enlaces de descarga
    const audioData = await fetchFromApi("audio", videoUrl);
    const videoData = await fetchFromApi("video", videoUrl);

    console.log("Datos finales obtenidos:");
    console.log("Audio URL:", audioData.downloadUrl);
    console.log("Video URL:", videoData.downloadUrl);

    return {
      audioUrl: audioData.downloadUrl,
      videoUrl: videoData.downloadUrl,
    };
  } catch (error) {
    console.error("Error en handleCommand:", error.message);
    throw error;
  }
};