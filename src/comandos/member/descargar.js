const { PREFIX } = require("../../krampus");
const playdl = require('play-dl');

module.exports = {
  name: 'descargar',
  description: 'Descarga el audio de un video de YouTube',
  commands: ['descargar', 'dl'],
  usage: `${PREFIX}descargar <URL del video>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (args.length < 1) {
      await sendReply('Uso incorrecto. Por favor, proporciona el URL del video.');
      return;
    }

    const videoUrl = args[0];
    console.log(`Descargando audio de ${videoUrl}...`);

    try {
      const audioBuffer = await playdl.download({ url: videoUrl, quality: 'highestaudio' });
      console.log(`Audio descargado con éxito: ${audioBuffer.length} bytes`);

      await socket.sendMessage(remoteJid, {
        audio: audioBuffer,
        caption: `Audio descargado de ${videoUrl}`,
      });

      console.log(`Mensaje de audio enviado con éxito.`);
    } catch (error) {
      console.error(`Error al descargar el audio: ${error}`);
      await sendReply('Ocurrió un error al descargar el audio. Por favor, inténtalo de nuevo.');
    }
  },
};
