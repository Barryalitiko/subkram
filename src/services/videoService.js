const axios = require("axios");
const { BASE_API_URL } = require("../krampus");

const downloadVideo = async () => {
  try {
    // Hacemos una petición GET a la API para obtener el video
    const response = await axios.get(`${BASE_API_URL}/download-video`, {
      responseType: "stream", // Indicar que la respuesta es un stream de datos
    });

    // El video se obtiene como un stream, aquí se puede retornar o manejar como se desee
    return response.data; // Retornamos el stream de datos del video
  } catch (error) {
    console.error("Error al descargar el video:", error);
    throw new Error("Error al obtener el video.");
  }
};

module.exports = { downloadVideo };