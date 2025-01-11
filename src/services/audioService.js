const axios = require("axios");
const { BASE_API_URL } = require("../krampus");
const playdl = require("play-dl");

const fetchPlayDlAudio = async (youtubeUrl) => {
  try {
    console.log(`Solicitando enlace de descarga para: ${youtubeUrl}`);

    // Validar la URL de YouTube antes de continuar
    if (!playdl.yt_validate(youtubeUrl)) {
      throw new Error("URL inválida de YouTube");
    }

    // Obtener información básica del video
    console.log("Obteniendo información básica del video...");
    const info = await playdl.video_basic_info(youtubeUrl);

    // Obtener la duración del video en segundos
    const durationInSeconds = info.video_details.durationInSec;

    console.log(`Duración del video: ${durationInSeconds} segundos`);

    // Obtener flujo de audio
    console.log("Obteniendo flujo de audio...");
    const stream = await playdl.stream(youtubeUrl, { quality: 2 });

    // Preparar la respuesta con la información adicional
    return {
      title: info.video_details.title,
      description: info.video_details.description,
      downloadUrl: stream.url,
      duration: durationInSeconds, // Duración en segundos
    };
  } catch (error) {
    console.error(
      `Error al obtener el enlace de descarga: ${error.message} - ${error.response?.data || "Sin detalles adicionales"}`
    );
    throw new Error("Error al obtener datos desde la API");
  }
};

module.exports = { fetchPlayDlAudio };