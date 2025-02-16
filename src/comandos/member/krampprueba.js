const { PREFIX } = require("../../krampus");
const { Client } = require('@whiskeysockets/baileys');

module.exports = {
  name: "serbot",
  description: "Iniciar subbot",
  commands: ["serbot"],
  usage: `${PREFIX}serbot`,
  handle: async ({ sendReply, sendReact, client }) => {
    // Crear subbot
    const subbot = new Client({
      // Configuración del subbot
    });

    // Generar QR para conexión
    const qr = await subbot.generateQR();

    // Enviar QR al usuario
    await sendReply(`Conecta tu subbot escaneando este QR:\n${qr}`);

    // Esperar a que el usuario se conecte
    subbot.on('open', () => {
      console.log('Usuario conectado');
    });

    // Procesar mensajes del subbot
    subbot.on('messages.upsert', (m) => {
      const message = m.messages[0];
      if (message.type === 'text') {
        const texto = message.text;
        if (texto === '#ping') {
          // Responder a #ping
          subbot.sendMessage('Pong!');
        } else if (texto === '#out') {
          // Desconectar subbot
          subbot.disconnect();
          await sendReply('Subbot desconectado');
        } else if (texto === '#stop') {
          // Parar subbot
          subbot.destroy();
          await sendReply('Subbot detenido');
        }
      }
    });

    // Manejo de desconexión
    subbot.on('close', () => {
      console.log('Subbot desconectado');
    });

    // Manejo de errores
    subbot.on('error', (err) => {
      console.error('Error en subbot:', err);
    });
  },
};
