const { dynamicCommand } = require("../middlewares/dynamicCommand");
const { loadCommonFunctions } = require("../middlewares/loadCommonFunctions");

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
  }
};
