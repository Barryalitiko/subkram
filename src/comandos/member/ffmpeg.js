const ffmpeg = require('fluent-ffmpeg');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: 'convert',
  description: 'Convierte un video de MP4 a GIF',
  usage: `${PREFIX}convert <url del video>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (!args[0]) {
      return sendReply('Por favor, proporciona la URL del video');
    }

    const videoUrl = args[0];
    const outputFile = 'output.gif';

    ffmpeg(videoUrl)
      .setFormat('gif')
      .setOutput(outputFile)
      .on('end', () => {
        socket.sendMessage(remoteJid, { video: fs.readFileSync(outputFile) });
        fs.unlinkSync(outputFile);
      })
      .on('error', (err) => {
        console.error(err);
        sendReply('Error al convertir el video');
      })
      .run();
  },
};






