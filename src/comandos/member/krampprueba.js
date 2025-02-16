const { PREFIX } = require("../../krampus");
const { Client } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "serbot",
  description: "Convertir número en bot con QR",
  commands: ["serbot"],
  usage: `${PREFIX}serbot`,
  handle: async ({ sendReply, sendReact, client }) => {
    const subbotName = `subkramp/${Date.now()}`;
    const subbotPath = path.join(__dirname, `../${subbotName}`);

    // Crear carpeta para el subbot
    fs.mkdirSync(subbotPath);

    // Crear archivo de configuración para el subbot
    const subbotConfig = {
      nombre: subbotName,
      descripcion: 'Subbot creado con QR',
      token: '',
    };
    fs.writeFileSync(`${subbotPath}/config.js`, `module.exports = ${JSON.stringify(subbotConfig, null, 2)};`);

    // Generar QR para el subbot
    const subbot = new Client();
    const qr = await subbot.generateQR();

    // Enviar QR al usuario
    await sendReply(`Escanea este QR para convertir tu número en bot:\n${qr}`);

    // Esperar a que el usuario se conecte
    subbot.on('open', () => {
      console.log('Usuario conectado');
    });

    // Guardar token del subbot
    subbot.on('qr', (token) => {
      subbotConfig.token = token;
      fs.writeFileSync(`${subbotPath}/config.js`, `module.exports = ${JSON.stringify(subbotConfig, null, 2)};`);
    });
  },
};
