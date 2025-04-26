const { connect } = require("./connect");
const { infoLog, bannerLog } = require("./utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");

    while (true) {
      await connect();
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5 segundos antes de volver a intentar si falla
    }

  } catch (error) {
    console.log(error);
    setTimeout(start, 5000); // Reintentar en caso de error global
  }
}

start();
