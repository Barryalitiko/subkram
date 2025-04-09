const { connect } = require("./connect");
const { infoLog, bannerLog } = require("./utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");
    const socket = await connect();

    // Agregar manejo de eventos para la conexión y desconexión del socket
    socket.ev.on("connection.update", (update) => {
      console.log("Conexión actualizada:", update);
    });
    socket.ev.on("disconnect", () => {
      console.log("Desconectado");
    });

    // Utilizar el socket para enviar o recibir mensajes según sea necesario
    // ...
  } catch (error) {
    console.log(error);
  }
}

start();
