const playdl = require('play-dl');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: 'música',
  description: 'Descarga y envía música desde YouTube',
  commands: ['m', 'play'],
  usage: `${PREFIX}música <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket, webMessage }) => {
    await handleMusicCommand(args, sendReply, remoteJid, socket, webMessage);
  }
};

async function handleMusicCommand(args, sendReply, remoteJid, socket, webMessage) {
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
    // Notificar que la música está siendo enviada
    sendReply(`Enviando música: ${video.title}`);
    // Enviar el audio directamente desde la URL
    await sendAudioFromURL(video.url, remoteJid, socket, webMessage);
  } catch (error) {
    console.error('Error manejando el comando de música:', error);
    sendReply('Hubo un error al intentar obtener la música.');
  }
}

const sendAudioFromURL = async (url, remoteJid, socket, webMessage) => {
  return await socket.sendMessage(
    remoteJid,
    {
      audio: { url },
      mimetype: "audio/mpeg",
    },
    { url, quoted: webMessage }
  );
};
