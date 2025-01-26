const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { autoReactions } = require("../utils/autoReactions");

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

    if (messageText) {
      // Verificamos las palabras clave para las reacciones automáticas
      for (const [keyword, emoji] of Object.entries(autoReactions)) {
        if (messageText.toLowerCase().includes(keyword)) {
          // Reaccionamos con el emoji correspondiente
          await socket.sendMessage(webMessage.key.remoteJid, {
            react: {
              text: emoji,
              key: webMessage.key,
            },
          });
          break;
        }
      }
    }
  }
};