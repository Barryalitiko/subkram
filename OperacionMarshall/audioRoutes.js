const express = require("express");
const router = express.Router();
const ytSearch = require("yt-search");
const ytdlp = require("yt-dlp");

router.get("/download", async (req, res) => {
  try {
    const searchQuery = req.query.search;

    if (!searchQuery) {
      return res.status(400).json({ error: "Debe proporcionar un término de búsqueda" });
    }

    // Usar yt-search para buscar el video en YouTube
    const results = await ytSearch(searchQuery);
    const video = results.videos[0];  // Tomar el primer resultado

    if (!video) {
      return res.status(404).json({ error: "No se encontró un video" });
    }

    // Obtener la URL de descarga del video usando yt-dlp
    const videoUrl = video.url;

    // Usar yt-dlp para obtener la información del video
    ytdlp.getInfo(videoUrl).then((info) => {
      // Filtrar el formato de audio de mayor calidad
      const audioFormat = info.formats.find((format) => format.audioCodec && format.acodec !== 'none' && format.ext === 'm4a');
      
      if (!audioFormat) {
        return res.status(404).json({ error: "No se encontró un formato de audio" });
      }

      // Devolver la URL de audio
      res.json({ audioUrl: audioFormat.url });
    }).catch((error) => {
      console.error("Error al obtener la información del video:", error);
      res.status(500).json({ error: "Error al obtener la información del video" });
    });

  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

module.exports = router;