const { connect } = require("./connect");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");
const express = require("express");

// Importar las rutas de audio
const audioRoutes = require("./audioRoutes");

async function start() {
  try {
    // Iniciar el servidor Express
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware para manejar las solicitudes JSON
    app.use(express.json());

    // Usar las rutas de audio
    app.use("/audio", audioRoutes);

    // Definir una ruta de ejemplo
    app.get("/", (req, res) => {
      res.send("¡Servidor Express está funcionando!");
    });

    // Iniciar el servidor Express
    app.listen(PORT, () => {
      console.log(`Servidor Express corriendo en puerto ${PORT}`);
    });

    // Mostrar el banner de inicio y el log de información
    bannerLog();
    infoLog("Kram está procesando...");

    // Conectar el socket
    const socket = await connect();

    // Cargar la lógica adicional con el socket
    load(socket);

  } catch (error) {
    console.log(error);
  }
}

start();