const { makeWASocket, fetchLatestBaileysVersion, initAuthCreds } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

// Ruta para guardar las credenciales
const AUTH_FILE_PATH = path.join(__dirname, 'auth_info.json');

// Cargar credenciales desde un archivo JSON
function loadAuthState() {
  try {
    const data = JSON.parse(fs.readFileSync(AUTH_FILE_PATH, 'utf-8'));
    return {
      creds: data.creds,
      keys: data.keys || {},
    };
  } catch (err) {
    console.log('No se encontraron credenciales previas, se generarán nuevas.');
    return {
      creds: initAuthCreds(),
      keys: {},
    };
  }
}

// Guardar credenciales en un archivo JSON
function saveAuthState(authState) {
  fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(authState, null, 2), 'utf-8');
}

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();

  const authState = loadAuthState();

  const sock = makeWASocket({
    version,
    auth: authState, // Cargar credenciales
  });

  // Guardar las credenciales cada vez que se actualicen
  sock.ev.on('creds.update', (creds) => {
    authState.creds = creds;
    saveAuthState(authState);
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Mostrar el QR en la terminal
    if (qr) {
      qrcode.generate(qr, { small: true }); // Mostrar QR en la terminal
    }

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
