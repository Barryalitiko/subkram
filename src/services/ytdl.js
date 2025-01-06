const express = require("express");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");

const app = express();
const port = 3000;

/**
 * Función para buscar y obtener el enlace de descarga de audio.
 */
const getAudioFromSearch = async (query) => {
  const searchResults = await ytSearch(query);
  const video = searchResults.videos[0];

  if (!video) {
    throw new Error("No se encontró ningún resultado para la búsqueda.");
  }

  const info = await ytdl.getInfo(video.url);
  const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
  const audioUrl = audioFormats[0]?.url;

  if (!audioUrl) {
    throw new Error("No se pudo generar el enlace de descarga de audio.");
  }

  return {
    title: video.title,
    downloadURL: audioUrl,
  };
};

/**
 * Función para buscar y obtener el enlace de descarga de video.
 */
const getVideoFromSearch = async (query) => {
  const searchResults = await ytSearch(query);
  const video = searchResults.videos[0];

  if (!video) {
    throw new Error("No se encontró ningún resultado para la búsqueda.");
  }

  const info = await ytdl.getInfo(video.url);
  const videoFormats = ytdl.filterFormats(info.formats, "video");
  const videoUrl = videoFormats[0]?.url;

  if (!videoUrl) {
    throw new Error("No se pudo generar el enlace de descarga de video.");
  }

  return {
    title: video.title,
    downloadURL: videoUrl,
  };
};

/**
 * Ruta para manejar solicitudes de descarga.
 */
app.get("/media", async (req, res) => {
  const query = req.query.query;
  const type = req.query.type || "audio"; // audio o video

  if (!query) {
    return res.status(400).json({ error: "Debe proporcionar un término de búsqueda." });
  }

  try {
    let result;

    if (type === "audio") {
      result = await getAudioFromSearch(query);
    } else if (type === "video") {
      result = await getVideoFromSearch(query);
    } else {
      return res.status(400).json({ error: "Tipo no válido. Use 'audio' o 'video'." });
    }

    res.json({
      title: result.title,
      downloadURL: result.downloadURL,
      type,
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = { getAudioFromSearch, getVideoFromSearch };