// src/loader.js
const { connect } = require("./src/connect");  // Ahora importamos desde services/connect
const { infoLog, errorLog } = require("../utils/logger");

async function load(socket) {
  try {
    infoLog("Cargando servicios...");

    // Aquí podrías agregar lógica para cargar más servicios si es necesario

    await connect();  // Llamamos a la función de conexión

    infoLog("Servicios cargados correctamente.");
  } catch (error) {
    errorLog("Error al cargar servicios: ", error);
  }
}

module.exports = { load };
