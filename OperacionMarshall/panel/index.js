import express from 'express';
import path from 'path'; // Para manejar rutas de archivos

const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile); // Configuración para renderizar HTML con EJS
app.set('view engine', 'html');

// Ruta principal (Inicio)
app.get('/', (req, res) => {
  res.render('index.html'); // Renderiza el archivo `views/index.html`
});

// Ruta para estadísticas
app.get('/stats', (req, res) => {
  const stats = {
    mensajesTotales: 1200,
    usuariosActivos: 50,
    grupos: 10,
  };
  res.render('stats.html', stats); // Renderiza `views/stats.html` con datos dinámicos
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express está funcionando en http://localhost:${PORT}`);
});