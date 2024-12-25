const { makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const { state, saveState } = useSingleFileAuthState(path.join(__dirname, 'auth_info.json'));

async function startBot() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const socket = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    version,
  });

  socket.ev.on('qr', (qr) => {
    console.log('Escanea el código QR:');
    console.log(qr);
  });

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      console.log('Conexión cerrada:', lastDisconnect.error);
      startBot(); 
    } else if (connection === 'open') {
      console.log('Krampus conectado con exito');
    }
  });


  socket.ev.on('creds.update', saveState);
}

startBot();
