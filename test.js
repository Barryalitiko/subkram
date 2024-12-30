const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const playdl = require('play-dl');
const fs = require('fs');

// Configuración para Baileys (crear y cargar sesión)
const { state, saveState } = useMultiFileAuthState('./auth_info'); // Ruta para guardar sesión

const startWhatsAppBot = async () => {
  try {
    // Obtener la última versión de Baileys
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log('Conectando a WhatsApp con la versión:', version);

    const socket = makeWASocket({
      version,
      auth: state,
    });

    // Guardar el estado de autenticación
    socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        console.log('Conexión perdida. Motivo:', lastDisconnect.error);
      } else if (connection === 'open') {
        console.log('Conectado a WhatsApp.');
      }
      saveState();
    });

    // Manejar los mensajes
    socket.ev.on('messages.upsert', async (m) => {
      const message = m.messages[0];
      const messageType = message.message?.conversation || message.message?.extendedTextMessage?.text;

      console.log('Mensaje recibido:', messageType);

      // Verificar si el mensaje contiene el comando de música
      if (messageType && messageType.startsWith('!música')) {
        const query = messageType.replace('!música', '').trim();
        console.log('Consulta recibida para búsqueda de música:', query);
        if (query) {
          await sendMusic(query, socket, message.key.remoteJid);
        } else {
          console.log('No se proporcionó consulta de música.');
          socket.sendMessage(message.key.remoteJid, { text: 'Por favor, proporciona el nombre o enlace del video de YouTube.' });
        }
      }
    });

    // Función para enviar música desde YouTube
    const sendMusic = async (query, socket, remoteJid) => {
      try {
        console.log(`Buscando video en YouTube: ${query}`);
        const searchResult = await playdl.search(query, { limit: 1 });
        console.log('Resultado de la búsqueda:', searchResult);

        if (searchResult.length === 0) {
          console.log('No se encontró ningún video.');
          socket.sendMessage(remoteJid, { text: 'No se encontró ningún video para la consulta.' });
          return;
        }

        const video = searchResult[0];
        console.log('Video encontrado:', video.title);

        // Obtener el stream de audio
        const streamInfo = await playdl.stream(video.url);
        console.log('Iniciando transmisión de audio desde YouTube...');

        // Convertir el stream a buffer
        const audioBuffer = await streamToBuffer(streamInfo.stream);
        console.log('Stream convertido a buffer con éxito.');

        // Guardar el buffer como archivo temporal
        const tempFilePath = './temp_audio.mp3';
        fs.writeFileSync(tempFilePath, audioBuffer);
        console.log('Archivo de audio temporal guardado:', tempFilePath);

        // Enviar el archivo de audio a WhatsApp
        await socket.sendMessage(remoteJid, { audio: fs.createReadStream(tempFilePath), mimetype: 'audio/mp3', ptt: true });
        console.log('Audio enviado con éxito.');

        // Eliminar archivo temporal después de enviarlo
        fs.unlinkSync(tempFilePath);
        console.log('Archivo temporal eliminado.');

      } catch (error) {
        console.error('Error al manejar la música:', error);
        socket.sendMessage(remoteJid, { text: 'Hubo un error al intentar obtener la música.' });
      }
    };

    // Función para convertir el stream de audio en un buffer
    const streamToBuffer = (stream) => {
      return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => {
          chunks.push(chunk);
        });
        stream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        stream.on('error', (error) => {
          reject(error);
        });
      });
    };

  } catch (error) {
    console.error('Error al iniciar el bot:', error);
  }
};

startWhatsAppBot().catch(console.error);