const { PREFIX } = require("../../krampus");

let antilinkSettings = {}; // Objeto para guardar configuraciones por grupo

module.exports = {
  name: 'antilink',
  description: 'Activar o desactivar el antilink en el grupo',
  commands: ['antilink'],
  usage: `${PREFIX}antilink <0|1|2>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    const action = args[0];

    if (action === '1') {
      antilinkSettings[remoteJid] = 'simple';
      return sendReply('Antilink activado en modo: simple (solo enlaces de WhatsApp).');
    }

    if (action === '2') {
      antilinkSettings[remoteJid] = 'completo';
      return sendReply('Antilink activado en modo: completo (todos los enlaces).');
    }

    if (action === '0') {
      delete antilinkSettings[remoteJid];
      return sendReply('Antilink desactivado.');
    }

    sendReply('Uso incorrecto. Ejemplo: #antilink 1 para activar en modo simple / #antilink 2 para activar en modo completo / #antilink 0 para desactivar.');
  },
};

// Middleware para detectar enlaces
const linkRegexSimple = /https?:\/\/chat\.whatsapp\.com/;
const linkRegexCompleto = /https?:\/\/\S+/;

module.exports.detectLinks = async ({ remoteJid, message, sender, isAdmin, socket }) => {
  const mode = antilinkSettings[remoteJid];
  if (!mode || isAdmin) return; // Si no está activado o el usuario es admin, ignorar

  const text = message?.conversation || message?.extendedTextMessage?.text || '';
  const linkDetected =
    mode === 'simple' ? linkRegexSimple.test(text) : linkRegexCompleto.test(text);

  if (linkDetected) {
    await socket.sendMessage(remoteJid, { delete: { id: message.key.id, remoteJid } });
    await socket.groupParticipantsUpdate(remoteJid, [sender], 'remove'); // Expulsar usuario
    console.log(`Usuario expulsado por enviar enlace en ${mode} mode.`);
  }
};