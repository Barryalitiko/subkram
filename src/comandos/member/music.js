const playdl = require('play-dl');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: 'música',
  description: 'Descarga y envía música desde YouTube',
  commands: ['m', 'pp'],
  usage: `${PREFIX}música <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    console.log('Comando música recibido con argumentos:', args);
    await handleMusicCommand(args, sendReply);
  }
};

async function handleMusicCommand(args, sendReply) {
  const query = args.join(' ');
  console.log('Consulta recibida:', query);

  try {
    // Buscar el video
    const searchResult = await playdl.search(query, { limit: 1 });
    if (searchResult.length === 0) {
      console.log('No se encontraron resultados para:', query);
      sendReply('No se encontró ningún video para la consulta.');
      return;
    }

    const video = searchResult[0];
    console.log('Video encontrado:', video);

    // Notificar que la música está siendo descargada
    await sendReply(`Iniciando la descarga de la música: "${video.title}"`);
    console.log(`Iniciando la descarga de audio del video: ${video.url}`);

    // Obtener el stream de audio
    const stream = await playdl.stream(video.url);
    console.log('Stream de audio obtenido con éxito.');

    // Guardar temporalmente el archivo
    const tempFilePath = path.join(__dirname, `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`);
    console.log('Archivo temporal será guardado en:', tempFilePath);

    const writeStream = fs.createWriteStream(tempFilePath);
    stream.stream.pipe(writeStream);

    // Verificar si se escribe el archivo correctamente
    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('El archivo fue escrito completamente:', tempFilePath);
        resolve();
      });
      writeStream.on('error', (error) => {
        console.error('Error escribiendo el archivo:', error);
        reject(error);
      });
    });

    // Leer el archivo y verificar su contenido
    if (fs.existsSync(tempFilePath)) {
      console.log('El archivo temporal existe:', tempFilePath);
    } else {
      console.error('El archivo temporal no fue creado.');
      throw new Error('El archivo temporal no existe.');
    }

    const audioBuffer = fs.readFileSync(tempFilePath);
    console.log('Buffer de audio leído, tamaño:', audioBuffer.length);

    // Enviar el archivo
    await sendReply(audioBuffer, {
      mimetype: 'audio/mp3',
      filename: `${video.title}.mp3`,
    });
    console.log('Audio enviado exitosamente al usuario.');

    // Eliminar el archivo temporal
    fs.unlinkSync(tempFilePath);
    console.log('Archivo temporal eliminado:', tempFilePath);

  } catch (error) {
    console.error('Error manejando el comando de música:', error);
    await sendReply('Hubo un error al intentar obtener la música.');
  }
}