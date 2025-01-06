const express = require('express');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

// Middleware para manejo de CORS (si lo necesitas)
const cors = require('cors');
app.use(cors());

// Ruta para buscar música o video y obtener enlace de descarga
app.get('/media', async (req, res) => {
  const query = req.query.query;
  const type = req.query.type || 'audio'; // 'audio' o 'video', por defecto 'audio'

  if (!query) {
    return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
  }

  try {
    // Paso 1: Buscar video en YouTube
    const result = await ytSearch(query);
    const videos = result.videos;

    if (videos.length === 0) {
      return res.status(404).json({ error: 'No se encontraron resultados para la búsqueda' });
    }

    // Seleccionar el primer video
    const video = videos[0];
    console.log(`Video encontrado: ${video.title} - ${video.url}`);

    // Paso 2: Obtener información del video
    const info = await ytdl.getInfo(video.url);
    let mediaUrl;

    if (type === 'audio') {
      // Para audio, filtrar los formatos de solo audio
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      mediaUrl = audioFormats[0]?.url;
      if (!mediaUrl) {
        return res.status(500).json({ error: 'No se pudo generar el enlace de descarga de audio' });
      }
    } else if (type === 'video') {
      // Para video, filtrar los formatos de video
      const videoFormats = ytdl.filterFormats(info.formats, 'video');
      mediaUrl = videoFormats[0]?.url;
      if (!mediaUrl) {
        return res.status(500).json({ error: 'No se pudo generar el enlace de descarga de video' });
      }
    } else {
      return res.status(400).json({ error: 'El tipo especificado no es válido. Usa "audio" o "video".' });
    }

    console.log(`Enlace de descarga (${type}): ${mediaUrl}`);

    // Responder con el enlace de descarga
    return res.json({
      title: video.title,
      downloadURL: mediaUrl,
      type: type,
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error.message);
    return res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});