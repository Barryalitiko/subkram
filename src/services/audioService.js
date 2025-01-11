const axios = require("axios");
const { BASE_API_URL } = require("../krampus");

const fetchPlayDlAudio = async (youtubeUrl) => {
  try {
    console.log(`Solicitando enlace de descarga para: ${youtubeUrl}`);
    const response = await axios.get(`${BASE_API_URL}/playdl-audio`, {
      params: { url: youtubeUrl },
    });

    if (!response.data || !response.data.downloadUrl) {
      throw new Error("No se pudo obtener un enlace de descarga válido");
    }

    return response.data; // Retornamos la información del audio
  } catch (error) {
    console.error(
      `Error al obtener el enlace de descarga: ${error.message} - ${error.response?.data || "Sin detalles adicionales"}`
    );
    throw new Error("Error al obtener datos desde la API");
  }
};

// Nueva función para video
const fetchPlayDlVideo = async (youtubeUrl) => {
  try {
    console.log(`Solicitando enlace de descarga para video: ${youtubeUrl}`);
    const response = await axios.get(`${BASE_API_URL}/playdl-video`, {
      params: { url: youtubeUrl },
    });

    if (!response.data || !response.data.downloadUrl) {
      throw new Error("No se pudo obtener un enlace de descarga válido para el video");
    }

    return response.data; // Retornamos la información del video
  } catch (error) {
    console.error(
      `Error al obtener el enlace de descarga para video: ${error.message} - ${error.response?.data || "Sin detalles adicionales"}`
    );
    throw new Error("Error al obtener datos desde la API para video");
  }
};

module.exports = { fetchPlayDlAudio, fetchPlayDlVideo };