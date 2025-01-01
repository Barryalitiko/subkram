const express = require("express");
const axios = require("axios");
const ytDlp = require("yt-dlp");

const app = express();

// Ruta para buscar y obtener la URL del audio desde YouTube
app.get("/audio/download", async (req, res) => {
  try {
    const searchQuery = req.query.search;
    if (!searchQuery) {
      return res.status(400).json({ error: "Se requiere un término de búsqueda" });
    }

    // Realizar búsqueda en YouTube usando yt-dlp
    const videoInfo = await ytDlp.getInfo(searchQuery);

    // Elegir el mejor formato de audio disponible
    const audioFormat = ytDlp.chooseFormat(videoInfo.formats, { quality: "highestaudio" });

    // Si no se encuentra un formato de audio, devolver error
    if (!audioFormat) {
      return res.status(404).json({ error: "No se encontró audio disponible" });
    }

    // Obtener la URL del audio
    const audioUrl = audioFormat.url;

    // Enviar la URL de audio en la respuesta
    return res.json({ url: audioUrl });
  } catch (error) {
    console.error("Error en la descarga de audio:", error);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// Iniciar el servidor en el puerto especificado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en puerto ${PORT}`);
});