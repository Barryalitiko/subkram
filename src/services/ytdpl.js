const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Crea un directorio si no existe.
 * @param {string} dirPath - Ruta del directorio.
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creando directorio: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`El directorio ya existe: ${dirPath}`);
  }
};

/**
 * Elimina un archivo después de un tiempo especificado.
 * @param {string} filePath - Ruta del archivo.
 * @param {number} timeout - Tiempo en milisegundos antes de eliminar el archivo.
 */
const scheduleFileDeletion = (filePath, timeout) => {
  console.log(
    `Archivo programado para eliminación después de ${timeout / 1000} segundos: ${filePath}`
  );
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error eliminando archivo: ${filePath}`, err);
        else console.log(`Archivo eliminado: ${filePath}`);
      });
    }
  }, timeout);
};

/**
 * Descarga un archivo utilizando yt-dlp.
 * @param {string} url - URL del contenido a descargar.
 * @param {string} format - Formato del archivo a descargar (mp3, mp4, etc.).
 * @param {string} folderName - Nombre de la carpeta donde se guardará.
 * @returns {Promise<string>} - Ruta del archivo descargado.
 */
const downloadWithYtDlp = (url, format, folderName) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "assets", folderName);
    ensureDirectoryExists(outputDir);

    let outputFile = path.join(outputDir, `${Date.now()}.${format}`);
    let count = 1;

    while (fs.existsSync(outputFile)) {
      outputFile = path.join(outputDir, `${Date.now()}_${count}.${format}`);
      count++;
    }

    const command = `yt-dlp -f best -o "${outputFile}" "${url}"`;

    console.log(`Ejecutando comando para descargar desde: ${url}`);
    console.log("Comando:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al descargar: ${stderr || error.message}`);
        return reject("Error al descargar el contenido.");
      }
      console.log(`Contenido descargado exitosamente: ${outputFile}`);
      console.log(stdout); // Mostrar stdout para más detalles
      console.error(stderr); // Mostrar cualquier mensaje de error

      scheduleFileDeletion(outputFile, 1 * 60 * 1000); // Eliminar después de 5 minutos
      resolve(outputFile);
    });
  });
};

/**
 * Descarga música desde YouTube.
 * @param {string} url - URL del video de YouTube.
 * @returns {Promise<string>} - Ruta del archivo de música descargado.
 */
const downloadMusic = (url) => {
  return downloadWithYtDlp(url, "mp3", "music");
};

/**
 * Descarga música desde YouTube Music.
 * @param {string} url - URL de la canción de YouTube Music.
 * @returns {Promise<string>} - Ruta del archivo de música descargado.
 */
const downloadYouTubeMusic = (url) => {
  return downloadWithYtDlp(url, "mp3", "youtube-music");
};

/**
 * Descarga videos desde YouTube.
 * @param {string} url - URL del video de YouTube.
 * @returns {Promise<string>} - Ruta del archivo de video descargado.
 */
const downloadVideo = (url) => {
  return downloadWithYtDlp(url, "mp4", "videos");
};

/**
 * Descarga videos desde TikTok.
 * @param {string} url - URL del video de TikTok.
 * @returns {Promise<string>} - Ruta del archivo de video descargado.
 */
const downloadTikTok = (url) => {
  return downloadWithYtDlp(url, "mp4", "tiktok");
};

/**
 * Descarga videos desde Instagram.
 * @param {string} url - URL del video de Instagram.
 * @returns {Promise<string>} - Ruta del archivo de video descargado.
 */
const downloadInstagram = (url) => {
  return downloadWithYtDlp(url, "mp4", "instagram");
};

/**
 * Descarga videos desde Facebook.
 * @param {string} url - URL del video de Facebook.
 * @returns {Promise<string>} - Ruta del archivo de video descargado.
 */
const downloadFacebook = (url) => {
  return downloadWithYtDlp(url, "mp4", "facebook");
};

/**
 * Descarga contenido desde Spotify.
 * @param {string} url - URL de la canción o playlist de Spotify.
 * @returns {Promise<string>} - Ruta del archivo descargado.
 */
const downloadSpotify = (url) => {
  return downloadWithYtDlp(url, "mp3", "spotify");
};

/**
 * Descarga videos desde X (Twitter).
 * @param {string} url - URL del video de X (Twitter).
 * @returns {Promise<string>} - Ruta del archivo descargado.
 */
const downloadTwitter = (url) => {
  return downloadWithYtDlp(url, "mp4", "twitter");
};

// Exportar las funciones
module.exports = {
  downloadMusic,
  downloadVideo,
  downloadTikTok,
  downloadInstagram,
  downloadFacebook,
  downloadSpotify,
  downloadTwitter,
  downloadYouTubeMusic,  // Nueva función añadida
};