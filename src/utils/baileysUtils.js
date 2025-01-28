const { getContentType } = require('@whiskeysockets/baileys');

/**
 * Verifica si un mensaje recibido es de un tipo específico.
 * @param {Object} webMessage - El mensaje recibido desde Baileys.
 * @param {String} type - El tipo de mensaje esperado (image, video, sticker, etc.).
 * @returns {Boolean} - Devuelve true si coincide el tipo, false en caso contrario.
 */
const baileysIs = (webMessage, type) => {
  if (!webMessage || !webMessage.message) return false; // Si no hay mensaje, devuelve false

  const messageType = getContentType(webMessage.message); // Obtiene el tipo real del mensaje
  const expectedType = `${type}Message`; // Convierte "image" a "imageMessage", etc.

  return messageType === expectedType; // Compara el tipo real con el esperado
};

module.exports = { baileysIs };