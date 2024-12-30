const playdl = require('play-dl');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: 'música',
  description: 'Descarga y envía música desde YouTube',
  commands: ['prueba', 'play'],
  usage: `${PREFIX}música <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    console.log('Comando música recibido con argumentos:', args);
    await handleMusicCommand(args, sendReply);
  }
};

async function handleMusicCommand(args, sendReply) {
  let query = args.join(' ');
  console.log('Consulta recibida:', query);

  try {
    let searchResult = await playdl.search(query, { limit: 1 });
    if (searchResult.length === 0) {
      sendReply('No se encontró ningún video para la consulta.');
      return;
    }

    let video = searchResult[0];
    console.log('Video encontrado:', video);

    sendReply(`Descargando música: ${video.title}`);
    let stream = await playdl.stream(video.url);
    console.log('Stream de audio obtenido:', stream);

    let audioBuffer = await streamToBuffer(stream.stream);
    console.log('Buffer de audio generado, tamaño:', audioBuffer.length);

    sendReply(audioBuffer, 'audio/mp3');
    console.log('Audio enviado exitosamente.');
  } catch (error) {
    console.error('Error manejando el comando de música:', error);
    sendReply('Hubo un error al intentar obtener la música.');
  }
}

function streamToBuffer(stream) {
  console.log('Convirtiendo stream a buffer...');
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => {
      console.log('Chunk recibido, tamaño:', chunk.length);
      chunks.push(chunk);
    });
    stream.on('end', () => {
      console.log('Stream completado, generando buffer...');
      resolve(Buffer.concat(chunks));
    });
    stream.on('error', error => {
      console.error('Error en el stream:', error);
      reject(error);
    });
  });
}