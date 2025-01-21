const { Canvas } = require('canvas');
const { PREFIX } = require('../../krampus');

module.exports = {
  name: 'canvas',
  description: 'Prueba de comando con Canvas',
  commands: ['canvas'],
  usage: `${PREFIX}canvas`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      const canvas = new Canvas(512, 512);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'red';
      ctx.fillRect(100, 100, 300, 300);

      ctx.font = '36px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('Hola, mundo!', 150, 250);

      const buffer = canvas.toBuffer('image/jpeg');

      await socket.sendMessage(remoteJid, { image: { buffer } });
    } catch (error) {
      console.error('Error al crear la imagen:', error);
      await sendReply('❌ Hubo un error al procesar tu solicitud.');
    }
  },
};
