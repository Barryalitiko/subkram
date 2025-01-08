const axios = require("axios");
const ytSearch = require("yt-search");
const { BASE_API_URL } = require("../krampus"); // Importar la URL base de la API

// Función para buscar un video en YouTube
async function searchVideo(query) {
  const results = await ytSearch(query);
  if (results.videos.length === 0) {
    throw new Error("No se encontraron resultados");
  }
  return results.videos[0]; // Retorna el primer video encontrado
}

// Función para procesar audio o video con la API
async function fetchFromApi(endpoint, url) {
  try {
    const response = await axios.get(`${BASE_API_URL}/${endpoint}`, {
      params: { url },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Error al obtener datos desde la API (${endpoint}): ${error.message}`
    );
  }
}

// Comando del bot
async function handleCommand(args) {
  const query = args.join(" ");
  let videoUrl;

  if (query.startsWith("http")) {
    // Caso: El usuario proporciona un enlace directo
    videoUrl = query;
  } else {
    // Caso: El usuario proporciona un término de búsqueda
    const video = await searchVideo(query);
    videoUrl = video.url;
    console.log(`Video encontrado: ${video.title} (${video.url})`);
  }

  // Usar la API para obtener los enlaces de descarga
  try {
    const audioData = await fetchFromApi("audio", videoUrl);
    const videoData = await fetchFromApi("video", videoUrl);

    return {
      audioUrl: audioData.downloadUrl,
      videoUrl: videoData.downloadUrl,
    };
  } catch (error) {
    console.error("Error al procesar la solicitud:", error.message);
    throw error;
  }
}

module.exports = { handleCommand, searchVideo, fetchFromApi };