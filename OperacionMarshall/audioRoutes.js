const express = require("express");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search"); // Librería para la búsqueda de YouTube

const router = express.Router();

// Ruta para buscar y descargar audio de YouTube
router.get("/download", async (req, res) => {
  const { url, search } = req.query;

  if (!url && !search) {
    return res.status(400).json({ error: "Se requiere una URL de video o un término de búsqueda" });
  }

  try {
    let videoUrl;

    if (url) {
      videoUrl = url; // Si la URL está proporcionada, la usamos directamente
    } else if (search) {
      // Si se proporcionó un término de búsqueda, buscamos el primer video de YouTube
      const result = await ytSearch(search);
      const video = result.videos[0]; // Tomamos el primer video encontrado
      videoUrl = video.url;
    }

    // Obtener información del video
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    res.header("Content-Type", format.mimeType);
    res.header("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp3"`);

    // Descargar el audio
    ytdl(videoUrl, { format: format }).pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

module.exports = router;