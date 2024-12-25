const { makeWASocket, fetchLatestBaileysVersion, initAuthCreds } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// Ruta para guardar las credenciales
const AUTH_FILE_PATH = path.join(__dirname, 'auth_info.json');

// Cargar credenciales desde un archivo JSON
function loadAuthState() {
  try {
    const data = JSON.parse(fs.readFileSync(AUTH_FILE_PATH, 'utf-8'));
    return { creds: data.creds, keys: data.keys || {}, };
  } catch (err) {
    console.log('No se encontraron credenciales previas, se generarán nuevas.');
    return { creds: initAuthCreds(), keys: {}, };
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
    printQRInTerminal: true,
    auth: authState,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log('Conexión establecida con éxito');
    } else if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log('Conexión cerrada, motivo:', reason);
      startBot(); // Reintentar conexión
    } else if (connection === 'qr') {
      console.log('Escanea el código QR:');
      console.log(update.qr);
      // Enviar el QR como imagen
      const qrImage = await generateQRImage(update.qr);
      // Enviar la imagen como respuesta
      sock.sendMessage('tu_numero_de_telefono', qrImage, 'image');
    }
  });

  sock.ev.on('creds.update', (creds) => {
    authState.creds = creds;
    saveAuthState(authState);
  });
}

async function generateQRImage(qr) {
  const qrCode = await QRCode.toString(qr, {
    type: 'png',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
  return qrCode;
}

startBot();
