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
 * Función para descargar música desde YouTube.
 * @param {string} url - URL del video de YouTube.
 * @returns {Promise<string>} - Ruta del archivo de música descargado.
 */
const downloadMusic = (url) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "assets", "music");
    ensureDirectoryExists(outputDir); // Asegura que la carpeta para música exista

    let outputFile = path.join(outputDir, `${Date.now()}.mp3`);
    let count = 1;

    // Comprobar si el archivo ya existe, y si es así, cambiar el nombre
    while (fs.existsSync(outputFile)) {
      outputFile = path.join(outputDir, `${Date.now()}_${count}.mp3`);
      count++;
    }

    const command = `yt-dlp -x --audio-format mp3 -o "${outputFile}" "${url}"`;

    console.log(`Ejecutando comando para descargar música desde: ${url}`);
    console.log("Comando:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al descargar música: ${stderr || error.message}`);
        return reject("Error al descargar música.");
      }
      console.log(`Música descargada exitosamente: ${outputFile}`);
      console.log(stdout);  // Mostrar el stdout para más detalles
      console.error(stderr); // Mostrar cualquier mensaje de error que se genere

      scheduleFileDeletion(outputFile, 3 * 60 * 1000); // Eliminar después de 3 minutos
      resolve(outputFile);
    });
  });
};

/**
 * Función para descargar video desde YouTube.
 * @param {string} url - URL del video de YouTube.
 * @returns {Promise<string>} - Ruta del archivo de video descargado.
 */
const downloadVideo = (url) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "assets", "videos");
    ensureDirectoryExists(outputDir); // Asegura que la carpeta para videos exista

    let outputFile = path.join(outputDir, `${Date.now()}.mp4`);
    let count = 1;

    // Comprobar si el archivo ya existe, y si es así, cambiar el nombre
    while (fs.existsSync(outputFile)) {
      outputFile = path.join(outputDir, `${Date.now()}_${count}.mp4`);
      count++;
    }

    const command = `yt-dlp -f best -o "${outputFile}" "${url}"`;

    console.log(`Ejecutando comando para descargar video desde: ${url}`);
    console.log("Comando:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al descargar video: ${stderr || error.message}`);
        return reject("Error al descargar video.");
      }
      console.log(`Video descargado exitosamente: ${outputFile}`);
      console.log(stdout);  // Mostrar el stdout para más detalles
      console.error(stderr); // Mostrar cualquier mensaje de error que se genere

      scheduleFileDeletion(outputFile, 3 * 60 * 1000); // Eliminar después de 3 minutos
      resolve(outputFile);
    });
  });
};

// Exportar las funciones para su uso en otros archivos
module.exports = { downloadMusic, downloadVideo };