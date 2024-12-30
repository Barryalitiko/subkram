const { DeliriussAPI } = require('@bochilteam/scraper');
const ytSearch = require('yt-search');
const axios = require('axios');
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
    // Buscar el video en YouTube usando yt-search
    console.log('Buscando video en YouTube...');
    const { videos } = await ytSearch(query);
    if (!videos.length) {
      console.log('No se encontraron resultados para:', query);
      sendReply('No se encontró ningún video para la consulta.');
      return;
    }
    const video = videos[0];
    console.log('Video encontrado:', video);
    
    // Obtener el enlace de audio de la API DeliriussAPI
    console.log('Obteniendo enlace de música...');
    const musicUrl = await DeliriussAPI.getAudioUrl(video.url);

    // Verificar tamaño del archivo
    const fileSize = await getFileSize(musicUrl);
    if (fileSize > 700 * 1024 * 1024) {
      sendReply('El archivo es demasiado grande para enviarlo directamente.');
      return;
    }

    // Notificar que la música está siendo enviada
    sendReply(`Enviando música: ${video.title}`);

    // Enviar el audio
    await sendAudioFromURL(musicUrl, remoteJid, socket, webMessage);
    console.log('Audio enviado con éxito.');
  } catch (error) {
    console.error('Error manejando el comando de música:', error);
    sendReply('Hubo un error al intentar obtener la música.');
  }
}

// Función para obtener el tamaño del archivo
async function getFileSize(url) {
  try {
    const response = await axios.head(url);
    return parseInt(response.headers['content-length'], 10);
  } catch (error) {
    console.error('Error al obtener el tamaño del archivo:', error);
    return 0;
  }
}

// Función para enviar el audio desde la URL
const sendAudioFromURL = async (url, remoteJid, socket, webMessage) => {
  console.log('Enviando audio desde la URL:', url);
  return await socket.sendMessage(
    remoteJid,
    {
      audio: { url, duration: 180 }, // Duración de 3 minutos
      mimetype: "audio/mpeg",
    },
    { quoted: webMessage }
  );
};