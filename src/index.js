const path = require("path");
const { question, onlyNumbers } = require("./utils");
const { connect } = require("./connect");  
const { warningLog, infoLog, errorLog, sayLog, successLog, bannerLog } = require("./utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");
    
    const socket = await connect();


  } catch (error) {
    errorLog("Error al iniciar el bot: ", error);
    process.exit(1);
  }
}

start();
