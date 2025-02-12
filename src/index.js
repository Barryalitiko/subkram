const { connect } = require("./connect");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");

    // Conectar bot principal
    const mainSocket = await connect();
    load(mainSocket);

    // Crear subbots
    const subbots = [
      { nombre: "Subbot 1", prefijo: "!" },
      { nombre: "Subbot 2", prefijo: "?" },
    ];

    subbots.forEach(async (subbot) => {
      const subbotSocket = await connect(subbot.nombre);
      load(subbotSocket, subbot.prefijo);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
