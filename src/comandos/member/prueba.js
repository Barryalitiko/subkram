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
    console.log(`Buscando video con la query: ${searchQuery}`);

    const results = await ytSearch(searchQuery);
    console.log(`Resultados de la búsqueda: ${results.length}`);

    if (results.length === 0) {
      await sendReply('No se encontraron resultados para tu búsqueda.');
      return;
    }

    const videoUrl = results[0].url;
    console.log(`URL del video seleccionado: ${videoUrl}`);

    const videoInfo = await ytdl.getInfo(videoUrl);
    console.log(`Información del video: ${JSON.stringify(videoInfo)}`);

    const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly');
    console.log(`Formatos de audio disponibles: ${audioFormats.length}`);

    const bestAudioFormat = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
    console.log(`Formato de audio seleccionado: ${JSON.stringify(bestAudioFormat)}`);

    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: bestAudioFormat });
    console.log(`Descargando audio...`);

    const audioBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      audioStream.on('data', (chunk) => chunks.push(chunk));
      audioStream.on('end', () => resolve(Buffer.concat(chunks)));
      audioStream.on('error', (error) => reject(error));
    });

    console.log(`Audio descargado con éxito`);

    await socket.sendMessage(remoteJid, {
      audio: audioBuffer,
      caption: `Audio descargado de ${videoInfo.videoDetails.title}`,
    });

    console.log(`Mensaje de audio enviado con éxito`);
  },
};
