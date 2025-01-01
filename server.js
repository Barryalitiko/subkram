// server.js

const express = require('express');
const app = express();

// Configura el puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 3000;

// Middleware para analizar el cuerpo de las solicitudes (req.body)
app.use(express.json()); // Para procesar solicitudes con JSON

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

// Ruta de ejemplo para manejar un POST
app.post('/data', (req, res) => {
  const { data } = req.body;
  res.json({ receivedData: data });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});