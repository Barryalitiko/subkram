const { PREFIX } = require("../../krampus");

let antilinkSettings = {}; // Objeto para guardar configuraciones por grupo

module.exports = {
  name: 'antilink',
  description: 'Activar o desactivar el antilink en el grupo',
  commands: ['antilink'],
  usage: `${PREFIX}antilink <on|off> <simple|completo>`,
  handle: async ({ args, remoteJid, sendReply, isGroupAdmin, isBotAdmin }) => {
    const action = args[0]?.toLowerCase();
    const mode = args[1]?.toLowerCase();

    if (action === 'on') {
      if (mode !== 'simple' && mode !== 'completo') {
        return sendReply('Por favor, especifica el modo: simple o completo.');
      }
      antilinkSettings[remoteJid] = mode;
      return sendReply(`Antilink activado en modo: ${mode}`);
    }

    if (action === 'off') {
      delete antilinkSettings[remoteJid];
      return sendReply('Antilink desactivado.');
    }

    sendReply('Uso incorrecto. Ejemplo: antilink on simple / antilink off');
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