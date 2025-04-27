const { connect } = require("./connect");
const { infoLog, bannerLog } = require("./utils/logger");

let cloneCounter = 1; // Empezamos en 1 para identificar cada subbot

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");

    while (true) {
      await connect(cloneCounter); // Le pasamos el número de clon
      cloneCounter++; // Incrementamos para el siguiente subbot
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5 segundos antes de volver a intentar
    }

  } catch (error) {
    console.log(error);
    setTimeout(start, 5000); // Reintentar en caso de error global
  }
}

start();
