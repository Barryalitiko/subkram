const { connect } = require("./connect");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb"); // Usamos MongoClient de MongoDB directamente
const { logCommandUsage, logGroupStats } = require("./db"); // Mantener la función para registrar datos

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
      const stats = await logGroupStats();  // Función para obtener estadísticas del grupo desde la base de datos
      res.json(stats);
    });

    // Iniciar el servidor Express
    app.listen(PORT, () => {
      console.log(`Servidor Express corriendo en puerto ${PORT}`);
    });

    // Mostrar el banner de inicio y el log de información
    bannerLog();
    infoLog("Kram está procesando...");

    // Conectar a MongoDB utilizando MongoClient
    const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Conectado a la base de datos");

    // Conectar el socket
    const socket = await connect();

    // Cargar la lógica adicional con el socket
    load(socket);

    // Usar el cliente de MongoDB para acceder a la base de datos y realizar operaciones
    const db = client.db("krampus-bot");
    // Ahora puedes acceder a las colecciones dentro de la base de datos `krampus-bot`

  } catch (error) {
    console.log(error);
  }
}

start();