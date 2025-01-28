const { downloadMediaMessage, getContentType } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

/**
 * Extrae información clave del mensaje recibido.
 * @param {object} webMessage - Mensaje recibido.
 * @returns {object} Datos relevantes del mensaje.
 */
const extractDataFromMessage = (webMessage) => {
  const message = webMessage.message || {};
  const messageType = getContentType(webMessage.message);

  return {
    args: webMessage.body?.split(" ").slice(1) || [],
    commandName: webMessage.body?.split(" ")[0] || "",
    fullArgs: webMessage.body?.split(" ").slice(1).join(" ") || "",
    fullMessage: webMessage.body || "",
    isReply: !!webMessage.message?.extendedTextMessage,
    prefix: webMessage.body?.[0] || "",
    remoteJid: webMessage.key.remoteJid,
    replyJid: webMessage.message?.extendedTextMessage?.contextInfo?.participant || null,
    userJid: webMessage.key.participant || webMessage.key.remoteJid,
    messageType,
  };
};

/**
 * Verifica si el mensaje es de un tipo específico.
 * @param {object} webMessage - Mensaje recibido.
 * @param {string} type - Tipo de mensaje esperado (image, video, sticker, etc.).
 * @returns {boolean} Si el mensaje coincide con el tipo.
 */
const baileysIs = (webMessage, type) => {
  const messageType = getContentType(webMessage.message);
  return messageType === `${type}Message`;
};

/**
 * Descarga un archivo de medios del mensaje recibido.
 * @param {object} webMessage - Mensaje recibido.
 * @param {string} fileName - Nombre del archivo a guardar.
 * @param {string} type - Tipo de medio (image, video, sticker).
 * @param {string} extension - Extensión del archivo a guardar.
 * @returns {string} Ruta del archivo descargado.
 */
const download = async (webMessage, fileName, type, extension) => {
  try {
    const messageType = getContentType(webMessage.message);
    if (messageType !== `${type}Message`) {
      throw new Error(`El mensaje no contiene un archivo de tipo ${type}`);
    }

    const mediaStream = await downloadMediaMessage(webMessage, "stream", {}, {});
    const filePath = path.join(__dirname, `../assets/${fileName}.${extension}`);
    const writeStream = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      mediaStream.pipe(writeStream);
      mediaStream.on("end", resolve);
      mediaStream.on("error", reject);
    });

    console.log(`Archivo ${fileName}.${extension} descargado en: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
    throw new Error("No se pudo descargar el archivo.");
  }
};

module.exports = {
  extractDataFromMessage,
  baileysIs,
  download,
};