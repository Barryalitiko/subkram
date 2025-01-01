const express = require("express");
const router = express.Router();
const ytdl = require("ytdl-core");

router.get("/download", async (req, res) => {
  try {
    const searchQuery = req.query.search;

    if (!searchQuery) {
      return res.status(400).json({ error: "Debe proporcionar un término de búsqueda" });
    }

    // Aquí iría tu lógica para buscar el video y obtener la URL de descarga
    const videoUrl = await getYouTubeVideoUrl(searchQuery);

    if (!videoUrl) {
      return res.status(404).json({ error: "No se encontró un video" });
    }

    // Devolver la URL del audio
    res.json({ url: videoUrl });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// Función de ejemplo para obtener la URL del video
async function getYouTubeVideoUrl(query) {
  try {
    const videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${query}`);
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    return audioFormat.url;
  } catch (error) {
    console.error("Error al obtener información de YouTube:", error);
    return null;
  }
}

module.exports = router;