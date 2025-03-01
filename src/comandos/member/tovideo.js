const { WAConnection, MessageType, Mimetype } = require('@whiskeysockets/baileys');
const chalk = require('chalk');
const fs = require('fs');
const { PREFIX } = require("../../krampus"); // Asegúrate de tener este PREFIX importado correctamente

// Almacena los subbots activos
const subbots = {};

// Función para conectar un subbot
async function connectSubbot(subbotId, phoneNumber) {
  const subbot = new WAConnection();
  subbots[subbotId] = subbot; // Guardamos el subbot activo

  // Maneja la generación del QR
  subbot.on('qr', (qr) => {
    console.log(chalk.yellow(`📸 Generando QR para el subbot ${subbotId}...`));
    sendQRToUser(qr, subbotId); // Envía el QR al usuario
  });

  // Maneja el estado de la conexión
  subbot.on('connecting', () => {
    console.log(chalk.blue(`🔄 Conectando el subbot ${subbotId}...`));
  });

  subbot.on('open', () => {
    console.log(chalk.green(`✅ Conexión exitosa del subbot ${subbotId}!`));
  });

  // Maneja el cierre de la conexión
  subbot.on('close', (reason) => {
    console.log(chalk.red(`❌ La conexión del subbot ${subbotId} se cerró. Razón: ${reason}`));
    reconnectSubbot(subbotId); // Reintenta la conexión si se cierra
  });

  try {
    await subbot.connect(); // Intentar la conexión
    console.log(chalk.green(`✅ Subbot ${subbotId} conectado exitosamente!`));
  } catch (error) {
    console.log(chalk.red(`❌ Error al conectar el subbot ${subbotId}: ${error.message}`));
    reconnectSubbot(subbotId); // Reintentar en caso de fallo
  }
}

// Reintentar la conexión de un subbot si se cierra
async function reconnectSubbot(subbotId) {
  console.log(chalk.yellow(`🔄 Reintentando conexión del subbot ${subbotId}...`));
  setTimeout(() => {
    connectSubbot(subbotId); // Reintenta la conexión
  }, 5000); // Reintento después de 5 segundos
}

// Función para enviar QR al usuario
async function sendQRToUser(qr, subbotId) {
  // Aquí puedes implementar el código para enviar el QR a los usuarios a través de WhatsApp
  console.log(chalk.blue(`QR generado para el subbot ${subbotId}: ${qr}`));
}

// Comando para iniciar el subbot
module.exports = {
  name: "startsubbot",
  description: "Inicia un subbot y envía el QR.",
  commands: [`${PREFIX}startsubbot`],
  usage: `${PREFIX}startsubbot [número de teléfono]`,
  handle: async ({ args, socket, remoteJid, sendReply }) => {
    // Verificar si se pasó el número de teléfono como argumento
    if (args.length < 1) {
      await sendReply("Uso incorrecto. Debes proporcionar el número de teléfono del subbot.");
      return;
    }

    const phoneNumber = args[0]; // El número de teléfono del subbot
    const subbotId = `subbot_${Date.now()}`; // Generamos un ID único para el subbot

    // Iniciar el subbot y enviar el mensaje
    await sendReply(`🔄 Iniciando subbot para el número: ${phoneNumber}`);
    await connectSubbot(subbotId, phoneNumber); // Conectamos el subbot con el número de teléfono proporcionado
  },
};