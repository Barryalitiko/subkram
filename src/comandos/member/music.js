const playdl = require('play-dl');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: 'música',
  description: 'Descarga y envía música desde YouTube',
  commands: ['prueba', 'play'],
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
    if (searchResult.length === 0) {
      console.log('No se encontraron resultados para:', query);
      sendReply('No se encontró ningún video para la consulta.');
      return;
    }

    const video = searchResult[0];
    console.log('Video encontrado:', video);

    sendReply(`Descargando música: ${video.title}`);
    const stream = await playdl.stream(video.url);
    console.log('Stream de audio obtenido. Convirtiendo a buffer...');

    const audioBuffer = await streamToBuffer(stream.stream);
    console.log('Buffer de audio generado, tamaño:', audioBuffer.length);

    console.log('Enviando archivo de audio...');
    await socket.sendMessage(
      remoteJid,
      {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        ptt: false, // Cambia a `true` si quieres enviarlo como mensaje de voz
      },
      { quoted: webMessage }
    );
    console.log('Audio enviado con éxito.');
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
      console.log('Stream completado. Generando buffer...');
      resolve(Buffer.concat(chunks));
    });
    stream.on('error', error => {
      console.error('Error en el stream:', error);
      reject(error);
    });
  });
}