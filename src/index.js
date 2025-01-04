const { connect } = require("./connect");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");
const express = require("express");
const path = require("path");

// Importar las rutas de audio desde OperacionMarshall/audioRoutes.js
const audioRoutes = require("../OperacionMarshall/audioRoutes");

async function start() {
  try {
    // Iniciar el servidor Express
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Configurar motor de plantillas
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    // Middleware para manejar solicitudes JSON
    app.use(express.json());

    // Archivos estáticos (CSS, JS, imágenes)
    app.use(express.static(path.join(__dirname, "public")));

    // Rutas personalizadas
    app.use("/audio", audioRoutes);

    // Ruta principal: Mostrar una página de inicio para el panel
    app.get("/", (req, res) => {
      res.render("index", { title: "Panel de Control", message: "Bienvenido al panel de control" });
    });

    // Ruta para estadísticas del bot
    app.get("/stats", async (req, res) => {
      const stats = {
        uptime: process.uptime(),
        usersConnected: 123, // Simulado
        messagesProcessed: 4567, // Simulado
      };
      res.json(stats);
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