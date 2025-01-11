const axios = require('axios');
const { BASE_API_URL } = require("../krampus"); // Importamos BASE_API_URL desde krampus

/**
 * Obtiene el enlace de descarga de audio desde la API.
 * @param {string} youtubeUrl - URL de YouTube del video.
 * @returns {Promise<string>} - URL de descarga directa del audio.
 */
async function getAudioDownloadLink(youtubeUrl) {
  try {
    console.log(`Solicitando enlace de descarga para: ${youtubeUrl}`);

    // Usamos BASE_API_URL en lugar de definir una URL directamente
    const response = await axios.get(`${BASE_API_URL}/audio`, { params: { url: youtubeUrl } });

    // Verificamos si la respuesta contiene el enlace de descarga
    if (response.data && response.data.downloadUrl) {
      console.log(`Enlace de descarga obtenido: ${response.data.downloadUrl}`);
      return response.data.downloadUrl; // Retornamos la URL de descarga
    } else {
      throw new Error('No se pudo obtener el enlace de descarga');
    }
  } catch (error) {
    console.error('Error al obtener el enlace de descarga:', error.message);
    throw new Error('Error al procesar la solicitud de audio');
  }
}

module.exports = { getAudioDownloadLink };