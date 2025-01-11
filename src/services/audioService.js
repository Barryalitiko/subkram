const axios = require("axios");
const { BASE_API_URL } = require("../krampus");

const fetchPlayDlAudio = async (youtubeUrl) => {
  try {
    console.log(`Solicitando enlace de descarga para: ${youtubeUrl}`);
    const response = await axios.get(`${BASE_API_URL}/playdl-audio`, {
      params: { url: youtubeUrl },
    });
    return response.data; // Aquí recibimos la respuesta de la API
  } catch (error) {
    console.error(
      `Error al obtener el enlace de descarga: ${error.message} - ${error.response?.data || "Sin detalles adicionales"}`
    );
    throw new Error("Error al obtener datos desde la API");
  }
};

module.exports = { fetchPlayDlAudio };