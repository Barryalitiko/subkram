const express = require("express");
const playDL = require("play-dl"); // Requiere play-dl
const app = express();

app.get("/audio/download", async (req, res) => {
  try {
    const searchQuery = req.query.search;

    if (!searchQuery) {
      return res.status(400).json({ error: "La búsqueda no puede estar vacía" });
    }

    // Usar play-dl para obtener el stream del audio
    const stream = await playDL.stream(searchQuery);

    // Devolver la URL del audio
    res.json({ url: stream.url });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

module.exports = app;