const ytdl = require('ytdl-core');
const { PREFIX } = require('../../krampus');

module.exports = {
  name: 'descargar',
  description: 'Descarga el audio de un video de YouTube',
  commands: ['descargar', 'dl'],
  usage: `${PREFIX}descargar <URL del video>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    console.log(`Comando descargar ejecutado con argumentos: ${args}`);

    if (args.length < 1) {
      console.log(`Error: No se proporcionó el URL del video.`);
      await sendReply('Uso incorrecto. Por favor, proporciona el URL del video.');
      return;
    }

    const videoUrl = args[0];
    console.log(`URL del video: ${videoUrl}`);

    try {
      console.log(`Intentando descargar el audio del video...`);
      const audioStream = ytdl.downloadFromURL(videoUrl, { quality: 'highestaudio' });
      console.log(`AudioStream creado: ${audioStream}`);

      const audioBuffer = await new Promise((resolve, reject) => {
        console.log(`Esperando a que se descargue el audio...`);
        const chunks = [];
        audioStream.on('data', (chunk) => {
          console.log(`Chunk de audio recibido: ${chunk.length} bytes`);
          chunks.push(chunk);
        });
        audioStream.on('end', () => {
          console.log(`Descarga del audio completada.`);
          resolve(Buffer.concat(chunks));
        });
        audioStream.on('error', (error) => {
          console.error(`Error al descargar el audio: ${error}`);
          reject(error);
        });
      });

      console.log(`Audio descargado con éxito: ${audioBuffer.length} bytes`);

      await socket.sendMessage(remoteJid, {
        audio: audioBuffer,
        caption: `Audio descargado de ${videoUrl}`,
      });

      console.log(`Mensaje de audio enviado con éxito.`);
    } catch (error) {
      console.error(`Error al ejecutar el comando descargar: ${error}`);
      await sendReply('Ocurrió un error al ejecutar el comando. Por favor, inténtalo de nuevo.');
    }
  },
};
