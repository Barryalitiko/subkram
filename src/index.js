const { connect } = require("./connect");
const { infoLog, bannerLog } = require("./utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");

    const socket = await connect();

    // Ya no es necesario llamar a load aquí, lo hacemos en el evento "open" en connect.js
  } catch (error) {
    console.log(error);
  }
}

start();
