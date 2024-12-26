const path = require("path");
const { PREFIX } = require("../krampus");
const { infoLog, errorLog } = require("../utils/logger");
const fs = require("fs");

exports.dynamicCommand = async (commonFunctions) => {
  const { message, sender, groupId, socket } = commonFunctions;

  // Verificar si el mensaje comienza con el prefijo
  if (!message.startsWith(PREFIX)) {
    return;
  }

  // Obtener el comando y argumentos
  const args = message.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  try {
    // Ruta a la carpeta de comandos
    const commandsPath = path.resolve(__dirname, "../comandos");
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));

      // Comparar el nombre del comando
      if (command.name === commandName) {
        await command.execute({ args, message, sender, groupId, socket });
        infoLog(`Ejecutado comando: ${commandName} por ${sender}`);
        return;
      }
    }

    infoLog(`Comando no reconocido: ${commandName}`);
  } catch (error) {
    errorLog(`Error al ejecutar el comando ${commandName}: ${error.message}`);
  }
};
