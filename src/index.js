const { makeWASocket, fetchLatestBaileysVersion, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Ruta donde se guardarán las credenciales
const { state, saveState } = useSingleFileAuthState(path.join(__dirname, 'auth_info.json'));

async function startBot() {
    // Obtén la última versión de Baileys compatible con WhatsApp Web
    const { version } = await fetchLatestBaileysVersion();

    // Crea el socket de conexión
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // Configuración para que usemos `qrcode-terminal`
    });

    // Evento para guardar credenciales cuando sean actualizadas
    sock.ev.on('creds.update', saveState);

    // Manejo de eventos de conexión
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('Escanea el código QR para conectar tu cuenta:');
            qrcode.generate(qr, { small: true }); // Genera el QR en consola
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
            console.log('Conexión cerrada. Reintentando:', shouldReconnect);
            if (shouldReconnect) startBot(); // Reintenta la conexión si no es un error de autenticación
        } else if (connection === 'open') {
            console.log('Conexión establecida con éxito.');
        }
    });

    return sock;
}

// Inicia el bot
startBot()
    .then(() => console.log('Bot iniciado correctamente'))
    .catch((err) => console.error('Error al iniciar el bot:', err));
