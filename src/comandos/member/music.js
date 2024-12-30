const playdl = require('play-dl');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: 'música',
  description: 'Descarga y envía música desde YouTube',
  commands: ['m', 'prueba'],
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
  return await socket.sendMessage(
    remoteJid,
    {
      audio: { url, duration: 180 }, // Duración de 3 minutos
      mimetype: "audio/mpeg",
    },
    { url, quoted: webMessage }
  );
};
