const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { getContentType } = require("@whiskeysockets/baileys");

exports.onMessagesUpsert = async ({ socket, messages }) => {
  // Verificamos si hay mensajes
  if (!messages.length) {
    return;
  }

  for (const webMessage of messages) {
    // Cargamos funciones comunes necesarias para procesar el mensaje
    const commonFunctions = loadCommonFunctions({ socket, webMessage });

    // Si no se obtienen funciones comunes, pasamos al siguiente mensaje
    if (!commonFunctions) {
      continue;
    }

    // Identificamos el tipo de mensaje (texto, imagen, video, etc.)
    const messageType = getContentType(webMessage.message);

    if (messageType === "conversation" || messageType === "extendedTextMessage") {
      console.log("📜 Mensaje de texto recibido:", webMessage.message?.conversation || webMessage.message?.extendedTextMessage?.text);
    } else if (messageType === "imageMessage") {
      console.log("🖼️ Mensaje de imagen recibido.");
    } else if (messageType === "videoMessage") {
      console.log("🎥 Mensaje de video recibido.");
    } else {
      console.log(`📦 Otro tipo de mensaje recibido: ${messageType}`);
    }

    // Procesamos el comando dinámico usando las funciones comunes
    await dynamicCommand(commonFunctions);
  }
};