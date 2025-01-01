const express = require("express");
const ytdl = require("ytdl-core");
const router = express.Router();

// Ruta para descargar el audio de un video de YouTube
router.get("/download-audio", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send("URL del video es requerida");
  }

  try {
    // Verificar si la URL es válida
    if (!ytdl.validateURL(videoUrl)) {
      return res.status(400).send("URL no válida de YouTube");
    }

    // Obtener los detalles del video
    const info = await ytdl.getInfo(videoUrl);

    // Seleccionar el formato de audio (por ejemplo, audio de 128 kbps)
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });

    // Establecer los encabezados para la descarga
    res.header("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp3"`);
    res.header("Content-Type", "audio/mp3");

    // Pipe el stream del audio al response
    ytdl(videoUrl, { format: audioFormat }).pipe(res);
  } catch (error) {
    console.error("Error al procesar la solicitud", error);
    res.status(500).send("Hubo un error al procesar la solicitud");
  }
});

module.exports = router;