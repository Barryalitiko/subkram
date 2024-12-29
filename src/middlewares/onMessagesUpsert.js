const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { autoReactions } = require("../utils/autoReactions"); // Suponiendo que tienes un archivo para las reacciones automáticas

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

    // Procesamos el comando dinámico usando las funciones comunes
    await dynamicCommand(commonFunctions);

    // Extraemos el texto del mensaje
    const messageText = webMessage.message?.conversation;

    // Verificamos si hay palabras clave en el mensaje para activar la reacción automática
    if (messageText) {
      // Recorremos las palabras clave y sus reacciones
      for (const [keyword, emoji] of Object.entries(autoReactions)) {
        if (messageText.toLowerCase().includes(keyword)) {
          // Si encontramos una palabra clave, reaccionamos con el emoji correspondiente
          await socket.sendMessage(webMessage.key.remoteJid, {
            react: {
              text: emoji,
              key: webMessage.key,
            },
          });
          break; // Salimos después de la primera coincidencia (si solo quieres una reacción por mensaje)
        }
      }
    }
  }
};