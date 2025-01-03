const ffmpeg = require('fluent-ffmpeg');

module.exports = {
  name: 'convert',
  description: 'Convierte un video de MP4 a GIF',
  usage: `${PREFIX}convert`,
  handle: async ({ args, remoteJid, sendReply, socket, webMessage }) => {
    if (!webMessage.quoted) {
      return sendReply('Por favor, responde a un mensaje con un video');
    }

    const quotedMessage = webMessage.quoted;
    if (!quotedMessage.video) {
      return sendReply('El mensaje que respondiste no contiene un video');
    }

    const videoBuffer = quotedMessage.video;
    const outputFile = 'output.gif';

    ffmpeg(videoBuffer)
      .setFormat('gif')
      .setOutput(outputFile)
      .on('end', () => {
        socket.sendMessage(remoteJid, { video: fs.readFileSync(outputFile) }, { quoted: webMessage });
        fs.unlinkSync(outputFile);
      })
      .on('error', (err) => {
        console.error(err);
        sendReply('Error al convertir el video');
      })
      .run();
  },
};
