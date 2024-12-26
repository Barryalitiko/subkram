// src/loader.js

const { connect } = require("./index");  // Ajusta la ruta según sea necesario
const { infoLog, errorLog } = require("utils/logger");

async function load(socket) {
  try {
    infoLog("Cargando servicios...");

    // Ejemplo de cargar otros servicios o inicializar el socket
    await connect();

    infoLog("Servicios cargados correctamente.");
  } catch (error) {
    errorLog("Error al cargar servicios: ", error);
  }
}

module.exports = { load };
