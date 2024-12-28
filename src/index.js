const { connect } = require("./connect");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");
const { startDashboard } = require("./dashboard"); // Importar el dashboard

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");

    const socket = await connect();

    load(socket);

    // Iniciar el dashboard
    startDashboard(socket);
    infoLog("Panel de control iniciado correctamente.");
  } catch (error) {
    console.log(error);
  }
}

start();