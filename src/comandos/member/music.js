const playdl = require('play-dl');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus"); // Ajusta la ruta según tu proyecto

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

// Función principal para manejar el comando de música
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
    sendReply(`Descargando música: ${video.title}`);
    console.log('Iniciando la descarga de audio desde:', video.url);

    // Obtener el stream de audio
    const stream = await playdl.stream(video.url);
    console.log('Stream de audio obtenido. Preparando para guardar...');

    // Guardar temporalmente el archivo
    const tempFilePath = path.join(__dirname, `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`);
    const writeStream = fs.createWriteStream(tempFilePath);

    stream.stream.pipe(writeStream);

    // Esperar a que el stream termine de escribir
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log('Archivo guardado exitosamente:', tempFilePath);

    // Leer el archivo y enviarlo
    const audioBuffer = fs.readFileSync(tempFilePath);
    console.log('Buffer de audio leído, tamaño:', audioBuffer.length);

    // Enviar el archivo
    await sendReply(audioBuffer, { mimetype: 'audio/mp3', filename: `${video.title}.mp3` });
    console.log('Audio enviado exitosamente.');

    // Eliminar el archivo temporal
    fs.unlinkSync(tempFilePath);
    console.log('Archivo temporal eliminado:', tempFilePath);

  } catch (error) {
    console.error('Error manejando el comando de música:', error);
    sendReply('Hubo un error al intentar obtener la música.');
  }
}