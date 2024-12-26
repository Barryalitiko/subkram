const { connect } = require("./connect");
const { infoLog, errorLog } = require("./utils/logger");

async function load(socket) {
  try {
    infoLog("Cargando servicios...");


    await connect();  

    infoLog("CARGANDO OPERACION MARSHALL...");
  } catch (error) {
    errorLog("Error al cargar servicios: ", error);
  }
}

module.exports = { load };
