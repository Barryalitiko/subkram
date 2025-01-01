const express = require("express");
const router = express.Router();
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");

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

    // Obtener la URL de descarga del video usando ytdl-core
    const videoUrl = video.url;
    const info = await ytdl.getInfo(videoUrl);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    if (!audioFormat) {
      return res.status(404).json({ error: "No se encontró un formato de audio" });
    }

    // Devolver la URL del audio
    res.json({ audioUrl: audioFormat.url });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

module.exports = router;