const { infoLog, errorLog } = require("../utils/logger");
const { PREFIX } = require("../krampus");

exports.loadCommonFunctions = ({ socket, webMessage }) => {
  try {
    // Validar el contenido del mensaje
    if (!webMessage || !webMessage.message) {
      return null;
    }

    // Extraer información del mensaje
    const { key, message } = webMessage;
    const remoteJid = key.remoteJid;
    const isGroup = remoteJid.endsWith("@g.us");
    const sender = isGroup ? key.participant : remoteJid;

    // Verificar si es un mensaje de texto
    const textMessage =
      message.conversation ||
      (message.extendedTextMessage && message.extendedTextMessage.text);

    if (!textMessage) {
      return null;
    }

    // Crear un objeto con las funciones comunes
    const commonFunctions = {
      socket,
      remoteJid,
      sender,
      groupId: isGroup ? remoteJid : null,
      message: textMessage.trim(),
      isGroup,
    };

    // Log de mensajes para depuración
    if (textMessage.startsWith(PREFIX)) {
      infoLog(
        `Mensaje detectado con prefijo: "${textMessage}" de ${sender} en ${
          isGroup ? "grupo" : "chat privado"
        }`
      );
    }

    return commonFunctions;
  } catch (error) {
    errorLog("Error al cargar funciones comunes: ", error.message);
    return null;
  }
};
