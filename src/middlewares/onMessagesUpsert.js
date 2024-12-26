const { PREFIX } = require("../krampus");
const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const comandosPath = path.join(__dirname, '..', 'comandos');
  const comandosFiles = fs.readdirSync(comandosPath).filter(file => file.endsWith('.js'));

  const comandos = {};

  comandosFiles.forEach(file => {
    const comando = require(path.join(comandosPath, file));
    comandos[comando.name] = comando;
  });

  client.ev.on("messages.upsert", async (messageUpsert) => {
    const message = messageUpsert.messages[0]; // Obtenemos el primer mensaje del evento

    if (!message.key.fromMe && message.body) {
      console.log("Mensaje recibido:", message.body); // Agregar log para depurar

      if (message.body.startsWith(PREFIX)) {
        const args = message.body.slice(PREFIX.length).trim().split(/ +/); // Separamos los argumentos
        const commandName = args.shift().toLowerCase(); // Obtenemos el nombre del comando

        if (comandos[commandName]) {
          try {
            await comandos[commandName].execute(message, client, args); // Pasamos los argumentos
          } catch (error) {
            console.error(`Error al ejecutar el comando ${commandName}:`, error);
          }
        } else {
          console.log(`Comando ${commandName} no encontrado.`);
        }
      }
    }
  });
};
