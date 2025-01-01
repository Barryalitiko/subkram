const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");

const app = express();
const PORT = 3000;

// Carpeta donde se guardarán los archivos descargados
const DOWNLOADS_FOLDER = path.join(__dirname, "downloads");

// Crear la carpeta de descargas si no existe
if (!fs.existsSync(DOWNLOADS_FOLDER)) {
  fs.mkdirSync(DOWNLOADS_FOLDER);
}

// Ruta principal del servidor
app.get("/", (req, res) => {
  res.send("Servidor de descargas de audio está en funcionamiento.");
});

// Ruta para descargar audio desde YouTube
app.get("/download", async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).send("Debes proporcionar un parámetro 'search'.");
  }

  try {
    console.log("Búsqueda recibida:", search);

    // Buscar el video en YouTube
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`;
    console.log("URL de búsqueda en YouTube:", ytSearchUrl);

    const searchResponse = await axios.get(ytSearchUrl);
    const videoIdMatch = searchResponse.data.match(/"videoId":"(.*?)"/);

    if (!videoIdMatch) {
      return res.status(404).send("No se encontró ningún video.");
    }

    const videoId = videoIdMatch[1];
    console.log("ID del video encontrado:", videoId);

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("URL del video:", videoUrl);

    // Descargar el audio
    const outputFilePath = path.join(DOWNLOADS_FOLDER, `${videoId}.mp3`);
    console.log("Ruta del archivo de salida:", outputFilePath);

    if (!fs.existsSync(outputFilePath)) {
      console.log("El archivo no existe, iniciando descarga...");

      const audioStream = ytdl(videoUrl, {
        filter: "audioonly",
        quality: "highestaudio",
      });

      const writeStream = fs.createWriteStream(outputFilePath);

      audioStream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      console.log("Descarga completada:", outputFilePath);
    } else {
      console.log("El archivo ya existe, no se descargará de nuevo.");
    }

    // Enviar la URL del archivo descargado
    const fileUrl = `${req.protocol}://${req.get("host")}/files/${videoId}.mp3`;
    console.log("URL del archivo para el cliente:", fileUrl);

    res.json({
      title: `Audio de ${search}`,
      url: fileUrl,
    });
  } catch (error) {
    console.error("Error durante la descarga:", error);
    res.status(500).send("Ocurrió un error al procesar la solicitud.");
  }
});

// Ruta para servir los archivos descargados
app.use("/files", express.static(DOWNLOADS_FOLDER));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});