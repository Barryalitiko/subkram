const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { PREFIX } = require("../../krampus"); // Asegúrate de que este archivo tiene el prefijo configurado

module.exports = {
  name: 'música',
  description: 'Descarga y envía música desde YouTube',
  commands: ['m', 'play'],
  usage: `${PREFIX}música <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    console.log('Comando música recibido con argumentos:', args);
    await handleMusicCommand(args, sendReply);
  }
};

// Función para manejar el comando de música
async function handleMusicCommand(args, sendReply) {
  console.log('Iniciando manejo del comando música...');
  let query = args.join(' ');
  console.log('Consulta recibida:', query);

  try {
    let videoUrl = await searchVideo(query);
    console.log('URL del video encontrado:', videoUrl);

    if (videoUrl) {
      sendReply(`Buscando la música para: ${query}`);
      console.log('Iniciando la descarga de audio...');
      let audioStream = ytdl(videoUrl, { filter: 'audioonly' });
      console.log('Stream de audio obtenido:', audioStream);

      let audioBuffer = await streamToBuffer(audioStream);
      console.log('Buffer de audio generado, tamaño:', audioBuffer.length);

      sendReply(audioBuffer, 'audio/mp3');
      console.log('Audio enviado exitosamente.');
    } else {
      sendReply('No se pudo encontrar el video.');
      console.log('No se encontró ningún video para la consulta:', query);
    }
  } catch (error) {
    console.error('Error manejando el comando de música:', error);
    sendReply('Hubo un error al intentar obtener la música.');
  }
}

// Función para buscar el video en YouTube
async function searchVideo(query) {
  console.log('Iniciando búsqueda de video para:', query);

  try {
    let results = await ytSearch(query);
    console.log('Resultados de búsqueda recibidos:', results);

    let video = results.videos[0];
    console.log('Primer video encontrado:', video);

    return video ? video.url : null;
  } catch (error) {
    console.error('Error buscando video:', error);
    return null;
  }
}

// Función para convertir un stream a buffer
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