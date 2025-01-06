const { connect } = require("./connect");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");
const express = require("express");
const path = require("path");
const morgan = require("morgan"); // Para logs de solicitudes HTTP
const helmet = require("helmet"); // Para seguridad
const cors = require("cors"); // Para permitir solicitudes CORS

// Importar las rutas de audio desde OperacionMarshall/audioRoutes.js
const audioRoutes = require("../OperacionMarshall/audioRoutes");

class MyApiRestBaseUrl {
  constructor() {
    this.app = express(); // Crear la instancia de Express
    this.port = process.env.PORT || 3000; // Configurar el puerto
    this.middlewares(); // Cargar middlewares globales
    this.routes(); // Definir rutas
    this.handleErrors(); // Manejo de errores
  }

  // Cargar middlewares globales
  middlewares() {
    this.app.use(express.json()); // Parsear JSON
    this.app.use(express.urlencoded({ extended: false })); // Parsear datos de formularios
    this.app.use(morgan("dev")); // Logs de solicitudes HTTP
    this.app.use(helmet()); // Mejorar seguridad
    this.app.use(cors()); // Permitir solicitudes desde otros orígenes

    // Archivos estáticos (si tienes una carpeta pública para servir)
    this.app.use(express.static(path.join(__dirname, "public")));
  }

  // Definir rutas
  routes() {
    // Ruta principal: Mostrar una página de inicio para el panel
    this.app.get("/", (req, res) => {
      res.render("index", { title: "Panel de Control", message: "Bienvenido al panel de control" });
    });

    // Ruta para estadísticas del bot (sin conexión a MongoDB)
    this.app.get("/stats", async (req, res) => {
      const stats = {
        uptime: process.uptime(),
        usersConnected: 123, // Simulado
        messagesProcessed: 4567, // Simulado
      };
      res.json(stats);
    });

    // Rutas personalizadas
    this.app.use("/audio", audioRoutes);

    // Otras rutas adicionales, si las tienes
    this.app.get("/api", (req, res) => {
      res.json({ message: "Bienvenido a MyApiRestBaseUrl" });
    });
  }

  // Manejo de errores
  handleErrors() {
    // Capturar rutas no definidas
    this.app.use((req, res, next) => {
      res.status(404).json({ error: "Ruta no encontrada" });
    });

    // Middleware de manejo de errores
    this.app.use((err, req, res, next) => {
      console.error(err.stack); // Log del error
      res.status(500).json({ error: "Error interno del servidor" });
    });
  }

  // Iniciar el servidor
  start() {
    this.app.listen(this.port, () => {
      console.log(`API REST corriendo en: http://localhost:${this.port}`);
    });
  }
}

// Iniciar la clase de la API
const api = new MyApiRestBaseUrl();
api.start();

// Mostrar el banner de inicio y el log de información
bannerLog();
infoLog("Kram está procesando...");

// Conectar el socket
connect().then(socket => {
  load(socket); // Cargar la lógica adicional con el socket
}).catch(error => {
  console.error("Error al conectar el socket:", error);
});