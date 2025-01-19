const { getProfileImageData } = require('@whiskeysockets/baileys');
const fs = require('fs');
const { onlyNumbers } = require('../utils');
const welcomeConfigPath = require('path').resolve(__dirname, "..", "..", "assets", "welcome-config.json");

function getWelcomeConfig() {
  if (!fs.existsSync(welcomeConfigPath)) {
    fs.writeFileSync(welcomeConfigPath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(welcomeConfigPath, 'utf8'));
}

exports.onGroupParticipantsUpdate = async ({ groupParticipantsUpdate, socket }) => {
  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];
  const config = getWelcomeConfig();
  const welcomeOption = config[remoteJid];

  if (!welcomeOption || groupParticipantsUpdate.action !== "add") {
    return;
  }

  try {
    const { buffer, profileImage } = await getProfileImageData(socket, userJid);

    if (welcomeOption === '1') {
      // Opción 1: Enviar mensaje de bienvenida con etiquetado
      await socket.sendMessage(remoteJid, {
        text: `¡𝗕𝗶𝗲𝗻𝗲𝘃𝗲𝗻𝗶𝗱@ al grupo!\n@${onlyNumbers(userJid)}`,
        mentions: [userJid],
      });
    } else if (welcomeOption === '2') {
      // Opción 2: Enviar foto de perfil con mensaje
      if (profileImage) {
        await socket.sendMessage(remoteJid, {
          image: buffer,
          caption: `¡𝗕𝗶𝗲𝗻𝗲𝘃𝗲𝗻𝗶𝗱@ al grupo!\n@${onlyNumbers(userJid)}`,
          mentions: [userJid],
        });
      } else {
        await socket.sendMessage(remoteJid, {
          text: `¡𝗕𝗶𝗲𝗻𝗲𝗻𝗶𝗱@ al grupo!\n@${onlyNumbers(userJid)}\nNota: Esta persona no tiene foto de perfil.`,
          mentions: [userJid],
        });
      }
    }

    // Si no hay foto de perfil, se borra el archivo temporal
    if (profileImage && !profileImage.includes('default-user')) {
      fs.unlinkSync(profileImage);
    }
  } catch (error) {
    console.error('Error al gestionar la bienvenida:', error);
  }
};