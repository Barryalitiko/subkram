import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de vistas (si quieres usar plantillas como EJS, Pug, etc.)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // O usa 'html' si no necesitas plantillas dinámicas

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para estadísticas
app.get('/stats', (req, res) => {
  const stats = {
    mensajesTotales: 1200,
    usuariosActivos: 50,
    grupos: 10,
  };
  res.render('stats.html', stats); // Usa render si es un motor de plantillas, sendFile para HTML puro
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Panel corriendo en http://localhost:${PORT}`);
});