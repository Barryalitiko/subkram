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
  console.log(`Archivo programado para eliminación después de ${timeout / 1000} segundos: ${filePath}`);
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
 * Descarga música desde YouTube.
 * @param {string} url - URL del video.
 * @returns {Promise<string>} - Ruta del archivo descargado.
 */
const downloadMusic = (url) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "assets", "music");
    ensureDirectoryExists(outputDir);

    let outputFile = path.join(outputDir, `${Date.now()}.mp3`);
    const command = `yt-dlp -x --audio-format mp3 -o "${outputFile}" "${url}"`;

    console.log(`Descargando música desde: ${url}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al descargar música: ${stderr || error.message}`);
        return reject("Error al descargar música.");
      }
      console.log(`Música descargada exitosamente: ${outputFile}`);
      scheduleFileDeletion(outputFile, 1 * 60 * 1000);
      resolve(outputFile);
    });
  });
};

/**
 * Descarga videos desde YouTube.
 * @param {string} url - URL del video.
 * @returns {Promise<string>} - Ruta del archivo descargado.
 */
const downloadVideo = (url) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "assets", "videos");
    ensureDirectoryExists(outputDir);

    let outputFile = path.join(outputDir, `${Date.now()}.mp4`);
    const command = `yt-dlp -f best -o "${outputFile}" "${url}"`;

    console.log(`Descargando video desde: ${url}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al descargar video: ${stderr || error.message}`);
        return reject("Error al descargar video.");
      }
      console.log(`Video descargado exitosamente: ${outputFile}`);
      scheduleFileDeletion(outputFile, 1 * 60 * 1000);
      resolve(outputFile);
    });
  });
};

/**
 * Descarga videos desde TikTok.
 * @param {string} url - URL del video.
 * @returns {Promise<string>} - Ruta del archivo descargado.
 */
const downloadTikTokVideo = (url) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "assets", "tiktok");
    ensureDirectoryExists(outputDir);

    let outputFile = path.join(outputDir, `${Date.now()}.mp4`);
    const command = `yt-dlp -f best -o "${outputFile}" "${url}"`;

    console.log(`Descargando video desde TikTok: ${url}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al descargar video de TikTok: ${stderr || error.message}`);
        return reject("Error al descargar video de TikTok.");
      }
      console.log(`Video de TikTok descargado exitosamente: ${outputFile}`);
      scheduleFileDeletion(outputFile, 1 * 60 * 1000);
      resolve(outputFile);
    });
  });
};

/**
 * Descarga videos desde Instagram.
 * @param {string} url - URL del video.
 * @returns {Promise<string>} - Ruta del archivo descargado.
 */
const downloadInstagramVideo = (url) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "assets", "instagram");
    ensureDirectoryExists(outputDir);

    let outputFile = path.join(outputDir, `${Date.now()}.mp4`);
    const command = `yt-dlp -f best -o "${outputFile}" "${url}"`;

    console.log(`Descargando video desde Instagram: ${url}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al descargar video de Instagram: ${stderr || error.message}`);
        return reject("Error al descargar video de Instagram.");
      }
      console.log(`Video de Instagram descargado exitosamente: ${outputFile}`);
      scheduleFileDeletion(outputFile, 1 * 60 * 1000);
      resolve(outputFile);
    });
  });
};

// Exportar funciones
module.exports = {
  downloadMusic,
  downloadVideo,
  downloadTikTokVideo,
  downloadInstagramVideo,
};