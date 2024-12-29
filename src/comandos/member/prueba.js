const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const { PREFIX } = require('../../krampus');

module.exports = {
  name: 'descargar',
  description: 'Descarga el audio de un video de YouTube',
  commands: ['descargar', 'dl'],
  usage: `${PREFIX}descargar <título de la canción>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (args.length < 1) {
      await sendReply('Uso incorrecto. Por favor, proporciona el título de la canción.');
      return;
    }

    const searchQuery = args.join(' ');
    console.log(`Buscando canción con la query: ${searchQuery}`);

    try {
      const results = await ytSearch(searchQuery);
      console.log(`Resultados de la búsqueda: ${results.length}`);

      if (results.length === 0) {
        await sendReply('No se encontraron resultados para tu búsqueda.');
        return;
      }

      const videoUrl = results[0].url;
      console.log(`URL de la canción seleccionada: ${videoUrl}`);

      const audioStream = ytdl.downloadFromURL(videoUrl, { quality: 'highestaudio' });
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
        caption: `Audio descargado de ${results[0].title}`,
      });

      console.log(`Mensaje de audio enviado con éxito`);
    } catch (error) {
      console.error(`Error al ejecutar el comando descargar: ${error}`);
      await sendReply('Ocurrió un error al ejecutar el comando. Por favor, inténtalo de nuevo.');
    }
  },
};
