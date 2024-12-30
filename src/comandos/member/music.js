const axios = require('axios');
const playdl = require('play-dl');
const fs = require('fs');
const { PREFIX } = require('../../krampus'); // Ajusta según tu configuración

module.exports = {
  name: 'música',
  description: 'Descarga y envía música desde YouTube',
  commands: ['play', 'prueba'],
  usage: `${PREFIX}música <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket, webMessage }) => {
    console.log('Comando música recibido con argumentos:', args);
    await handleMusicCommand(args, sendReply, remoteJid, socket, webMessage);
  },
};

async function handleMusicCommand(args, sendReply, remoteJid, socket, webMessage) {
  const query = args.join(' ');
  console.log('Consulta recibida:', query);

  try {
    console.log('Buscando video en YouTube...');
    const searchResult = await playdl.search(query, { limit: 1 });
    console.log('Resultado de la búsqueda:', searchResult);

    if (searchResult.length === 0) {
      console.log('No se encontraron resultados para:', query);
      sendReply('No se encontró ningún video para la consulta.');
      return;
    }

    const video = searchResult[0];
    console.log('Video encontrado:', video);

    sendReply(`Descargando música: ${video.title}`);
    console.log('Obteniendo URL directa de audio...');
    const streamInfo = await playdl.audio(video.url, { quality: 2 }); // Calidad de audio
    console.log('URL directa obtenida:', streamInfo.url);

    console.log('Descargando audio con Axios...');
    const audioBuffer = await downloadAudioWithAxios(streamInfo.url);
    console.log('Descarga completada, tamaño del buffer:', audioBuffer.length);

    console.log('Enviando audio al chat...');
    await sendAudio(remoteJid, socket, webMessage, audioBuffer);
    console.log('Audio enviado con éxito.');
  } catch (error) {
    console.error('Error manejando el comando de música:', error);
    sendReply('Hubo un error al intentar obtener la música.');
  }
}

// Función para descargar el audio con Axios
async function downloadAudioWithAxios(url) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer', // Esto asegura que Axios devuelva un buffer
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error descargando el audio con Axios:', error);
    throw new Error('Error al descargar el archivo de audio.');
  }
}

// Función para enviar el audio al chat
async function sendAudio(remoteJid, socket, webMessage, audioBuffer) {
  try {
    await socket.sendMessage(
      remoteJid,
      {
        audio: audioBuffer,
        mimetype: 'audio/mp3',
      },
      { quoted: webMessage }
    );
  } catch (error) {
    console.error('Error enviando el audio:', error);
  }
}