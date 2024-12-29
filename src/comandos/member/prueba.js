const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const { PREFIX } = require('../../krampus');

module.exports = {
  name: 'descargar',
  description: 'Descarga el audio de un video de YouTube',
  commands: ['descargar', 'dl'],
  usage: `${PREFIX}descargar <título del video o URL>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (args.length < 1) {
      await sendReply('Uso incorrecto. Por favor, proporciona el título del video o la URL.');
      return;
    }

    const searchQuery = args.join(' ');
    const results = await ytSearch(searchQuery);

    if (results.length === 0) {
      await sendReply('No se encontraron resultados para tu búsqueda.');
      return;
    }

    const videoUrl = results[0].url;
    const videoInfo = await ytdl.getInfo(videoUrl);

    const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly');
    const bestAudioFormat = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });

    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: bestAudioFormat });
    const audioBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      audioStream.on('data', (chunk) => chunks.push(chunk));
      audioStream.on('end', () => resolve(Buffer.concat(chunks)));
      audioStream.on('error', (error) => reject(error));
    });

    await socket.sendMessage(remoteJid, {
      audio: audioBuffer,
      caption: `Audio descargado de ${videoInfo.videoDetails.title}`,
    });
  },
};
