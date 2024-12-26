const path = require("path");
const { question, onlyNumbers } = require("./utils");
const { connect } = require("./connect");  
const { warningLog, infoLog, errorLog, sayLog, successLog, bannerLog } = require("./utils/logger");
const { onMessagesUpsert } = require("./middlewares/onMessagesUpsert"); // Importamos el middleware

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");
    
    const socket = await connect();

    // Conectamos el middleware para que procese los mensajes
    socket.ev.on("messages.upsert", onMessagesUpsert(socket)); // Aquí estamos usando el middleware para manejar los mensajes

  } catch (error) {
    errorLog("Error al iniciar el bot: ", error);
    process.exit(1);
  }
}

start();
