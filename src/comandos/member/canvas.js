const { Canvas } = require('canvas');
const { PREFIX } = require('../../krampus');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'canvas',
  description: 'Prueba de comando con Canvas',
  commands: ['canvas'],
  usage: `${PREFIX}canvas <texto>`,
  handle: async ({ socket, remoteJid, sendReply, args }) => {
    try {
      const texto = args.join(' ');
      const canvas = new Canvas(512, 512);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'red';
      ctx.fillRect(100, 100, 300, 300);

      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(texto, 250, 200);

      const filePath = path.join(__dirname, 'canvas-image.jpg');
      const out = fs.createWriteStream(filePath);
      const stream = canvas.createJPEGStream();
      stream.pipe(out);
      out.on('finish', async () => {
        await socket.sendMessage(remoteJid, { image: { url: filePath } });
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('Error al crear la imagen:', error);
      await sendReply('❌ Hubo un error al procesar tu solicitud.');
    }
  },
};
