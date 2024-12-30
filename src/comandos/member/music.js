const playdl = require('play-dl');
const axios = require('axios');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: 'música',
  description: 'Descarga y envía música desde YouTube',
  commands: ['prueba', 'play'],
  usage: `${PREFIX}música <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket, webMessage }) => {
    console.log('Comando música recibido con argumentos:', args);
    await handleMusicCommand(args, sendReply, remoteJid, socket, webMessage);
  }
};

async function handleMusicCommand(args, sendReply, remoteJid, socket, webMessage) {
  const query = args.join(' ');
  console.log('Consulta recibida:', query);
  try {
    // Buscar el video
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
    // Notificar que la música está siendo enviada
    console.log('Enviando música...');
    sendReply(`Enviando música: ${video.title}`);
    // Enviar el audio directamente desde la URL
    console.log('Enviando audio desde la URL...');
    await sendAudioFromURL(video.url, remoteJid, socket, webMessage);
    console.log('Audio enviado con éxito.');
  } catch (error) {
    console.error('Error manejando el comando de música:', error);
    sendReply('Hubo un error al intentar obtener la música.');
  }
}

const sendAudioFromURL = async (url, remoteJid, socket, webMessage) => {
  console.log('Enviando audio desde la URL:', url);
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.3'
      },
      timeout: 30000 // Aumenta el tiempo de espera a 30 segundos
    });
    const audioBuffer = Buffer.from(response.data, 'binary');
    console.log('Tamaño del audio:', audioBuffer.length);
    return await socket.sendMessage(
      remoteJid,
      {
        audio: { url, duration: 0 },
        mimetype: "audio/mp3",
      },
      { url, quoted: webMessage }
    );
  } catch (error) {
    console.error('Error enviando audio:', error);
  }
};
