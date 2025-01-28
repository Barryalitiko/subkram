const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

/**
 * Verifica si un mensaje de Baileys contiene un tipo específico de medio.
 * @param {object} message - El mensaje de Baileys.
 * @param {string} type - El tipo de medio a verificar (e.g., "image", "video", "sticker").
 * @returns {boolean} - Verdadero si el mensaje contiene el tipo de medio especificado.
 */
const baileysIs = (message, type) => {
  return message?.message?.[`${type}Message`] ? true : false;
};

/**
 * Descarga contenido multimedia de un mensaje de Baileys.
 * @param {object} message - El mensaje de Baileys que contiene el contenido multimedia.
 * @param {string} fileName - El nombre del archivo a guardar (sin extensión).
 * @param {string} type - El tipo de medio (e.g., "image", "video", "sticker").
 * @param {string} ext - La extensión del archivo (e.g., "png", "mp4", "webp").
 * @returns {Promise<string>} - La ruta del archivo descargado.
 */
const download = async (message, fileName, type, ext) => {
  try {
    const mediaMessage = message.message?.[`${type}Message`];
    if (!mediaMessage) {
      throw new Error(`El mensaje no contiene un ${type}.`);
    }

    const stream = await downloadContentFromMessage(mediaMessage, type);
    const filePath = path.join(__dirname, "../../assets", `${fileName}.${ext}`);
    const fileStream = fs.createWriteStream(filePath);

    for await (const chunk of stream) {
      fileStream.write(chunk);
    }

    fileStream.end();

    console.log(`${type} descargado exitosamente en ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`Error al descargar el ${type}:`, error);
    throw new Error(`No se pudo descargar el ${type}.`);
  }
};

module.exports = {
  baileysIs,
  download,
};