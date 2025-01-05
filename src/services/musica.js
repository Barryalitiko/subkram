// Importar dependencias necesarias
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');
const path = require('path');
const axios = require('axios');  // Axios para peticiones HTTP
const fetch = require('node-fetch');  // Node-fetch para peticiones HTTP
const { default: Scraper } = require('@bochilteam/scraper');  // @bochilteam/scraper

// Función para buscar el video en YouTube usando yt-search
async function searchVideo(query) {
  try {
    const res = await ytSearch(query);
    const video = res.videos[0];  // Tomamos el primer video de la búsqueda
    console.log(`Encontrado: ${video.title}`);
    return video;
  } catch (error) {
    console.error("Error al buscar el video:", error);
    return null;
  }
}

// Función para descargar el audio del video (solo música)
async function downloadAudio(videoUrl, outputPath) {
  try {
    console.log("Descargando audio...");
    const stream = ytdl(videoUrl, { filter: 'audioonly' });
    const file = fs.createWriteStream(outputPath);
    stream.pipe(file);

    stream.on('end', () => {
      console.log("Descarga de audio completada.");
    });

    stream.on('error', (err) => {
      console.error("Error en la descarga de audio:", err);
    });
  } catch (error) {
    console.error("Error al descargar el audio:", error);
  }
}

// Función para descargar el video completo
async function downloadVideo(videoUrl, outputPath) {
  try {
    console.log("Descargando video...");
    const stream = ytdl(videoUrl, { quality: 'highest' });
    const file = fs.createWriteStream(outputPath);
    stream.pipe(file);

    stream.on('end', () => {
      console.log("Descarga de video completada.");
    });

    stream.on('error', (err) => {
      console.error("Error en la descarga de video:", err);
    });
  } catch (error) {
    console.error("Error al descargar el video:", error);
  }
}

// Función para obtener información adicional usando Axios o Node-fetch
async function getVideoInfo(videoUrl) {
  try {
    // Usando Axios
    const response = await axios.get(`https://www.youtube.com/oembed?url=${videoUrl}&format=json`);
    console.log("Información adicional (usando Axios):", response.data);

    // Usando Node-fetch
    const fetchResponse = await fetch(`https://www.youtube.com/oembed?url=${videoUrl}&format=json`);
    const fetchData = await fetchResponse.json();
    console.log("Información adicional (usando Node-fetch):", fetchData);
    
  } catch (error) {
    console.error("Error al obtener información adicional:", error);
  }
}

// Función para hacer scraping con @bochilteam/scraper
async function scrapeVideoDetails(videoUrl) {
  try {
    const videoDetails = await Scraper.getInfo(videoUrl);
    console.log("Detalles del video (usando scraper):", videoDetails);
  } catch (error) {
    console.error("Error al hacer scraping del video:", error);
  }
}

// Función principal para buscar y descargar música o video
async function downloadMedia(query, mediaType = 'audio') {
  const video = await searchVideo(query);

  if (!video) {
    console.log("No se encontró ningún video.");
    return;
  }

  const videoUrl = video.url;
  const videoTitle = video.title.replace(/[^a-zA-Z0-9]/g, '_');  // Filtrar caracteres no permitidos
  const outputDirectory = path.join(__dirname, 'downloads');

  // Crear directorio si no existe
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  const outputFilePath = path.join(outputDirectory, `${videoTitle}.${mediaType === 'audio' ? 'mp3' : 'mp4'}`);

  // Descargar según el tipo de medio solicitado
  if (mediaType === 'audio') {
    await downloadAudio(videoUrl, outputFilePath);
  } else if (mediaType === 'video') {
    await downloadVideo(videoUrl, outputFilePath);
  } else {
    console.log("Tipo de medio no reconocido. Usa 'audio' o 'video'.");
  }

  // Obtener información adicional con Axios, Node-fetch y scraper
  await getVideoInfo(videoUrl);
  await scrapeVideoDetails(videoUrl);
}

// Ejecutar la función de descarga
const query = 'Never Gonna Give You Up';  // Aquí puedes cambiar la consulta por la que desees buscar
const mediaType = 'audio';  // Cambia a 'video' si quieres descargar el video completo

downloadMedia(query, mediaType);