const { makeWASocket, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Ruta para guardar las credenciales
const AUTH_FILE_PATH = path.join(__dirname, 'auth_info.json');

// Cargar credenciales desde un archivo JSON
function loadAuth() {
  try {
    const data = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.log('No se encontraron credenciales previas, se generarán nuevas.');
    return undefined;
  }
}

// Guardar credenciales en un archivo JSON
function saveAuth(authData) {
  fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(authData, null, 2), 'utf-8');
}

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true, // Mostrar QR en la terminal
    auth: loadAuth(), // Cargar credenciales
  });

  // Guardar las credenciales cada vez que se actualicen
  sock.ev.on('creds.update', saveAuth);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log('Conexión cerrada, motivo:', reason);
      startBot(); // Reintentar conexión
    } else if (connection === 'open') {
      console.log('Conexión establecida con éxito');
    }
  });
}

startBot();
