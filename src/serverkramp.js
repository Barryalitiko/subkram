const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

class MyApiRestBaseUrl {
  constructor() {
    this.app = express(); // Crear la instancia de Express
    this.port = process.env.PORT || 4000; // Configurar el puerto
    this.middlewares(); // Cargar middlewares globales
    this.routes(); // Definir rutas
    this.handleErrors(); // Manejo de errores
  }

  // Cargar middlewares globales
  middlewares() {
    this.app.use(express.json()); // Parsear JSON
    this.app.use(express.urlencoded({ extended: false })); // Parsear datos de formularios
    this.app.use(morgan('dev')); // Logs de solicitudes HTTP
    this.app.use(helmet()); // Mejorar seguridad
    this.app.use(cors()); // Permitir solicitudes desde otros orígenes

    // Archivos estáticos (si tienes una carpeta pública para servir)
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  // Definir rutas
  routes() {
    // Rutas principales
    this.app.get('/', (req, res) => {
      res.json({ message: 'Bienvenido a MyApiRestBaseUrl' });
    });

    // Ejemplo de ruta para estadísticas
    this.app.get('/stats', (req, res) => {
      res.json({
        uptime: process.uptime(),
        status: 'ok',
      });
    });

    // Rutas adicionales (importa tus rutas aquí)
    const audioRoutes = require('./OperacionMarshall/audioRoutes');
    this.app.use('/audio', audioRoutes); // Montar rutas de audio
  }

  // Manejo de errores
  handleErrors() {
    // Capturar rutas no definidas
    this.app.use((req, res, next) => {
      res.status(404).json({ error: 'Ruta no encontrada' });
    });

    // Middleware de manejo de errores
    this.app.use((err, req, res, next) => {
      console.error(err.stack); // Log del error
      res.status(500).json({ error: 'Error interno del servidor' });
    });
  }

  // Iniciar el servidor
  start() {
    this.app.listen(this.port, () => {
      console.log(`API REST corriendo en: http://localhost:${this.port}`);
    });
  }
}

module.exports = MyApiRestBaseUrl;