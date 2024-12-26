const { connect } = require("./connect");
const { PREFIX } = require("./krampus");
const fs = require("fs");
const path = require("path");

async function start() {
  try {
    const client = await connect();

    const comandosPath = path.join(__dirname, 'comandos');
    const comandosFiles = fs.readdirSync(comandosPath).filter(file => file.endsWith('.js'));

    const comandos = {};

    comandosFiles.forEach(file => {
      const comando = require(path.join(comandosPath, file));
      comandos[comando.name] = comando;
    });

    client.ev.on("messages.upsert", async (messageUpsert) => {
      const message = messageUpsert.messages[0];
      if (!message.key.fromMe && message.body) {
        const args = message.body.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (comandos[commandName]) {
          await comandos[commandName].execute(message, client);
        }
      }
    });

  } catch (error) {
    console.error("Error al iniciar el bot:", error);
  }
}

// Inicia el bot
start();

