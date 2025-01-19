const fs = require('fs');
const { onlyNumbers } = require("../utils");
const { warningLog } = require("../utils/logger");

exports.onGroupParticipantsUpdate = async ({
  groupParticipantsUpdate,
  socket,
}) => {
  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];

  // Obtener la opción de bienvenida desde el archivo de configuración
  const welcomeConfig = getWelcomeConfig();

  // Verificar si la bienvenida está activada para este grupo
  const welcomeOption = welcomeConfig[remoteJid];

  if (welcomeOption === '0') {
    return; // Si la opción es 0, no se enviará ningún mensaje
  }

  if (groupParticipantsUpdate.action === "add") {
    try {
      if (welcomeOption === '1') {
        // Enviar mensaje con texto de bienvenida
        await socket.sendMessage(remoteJid, {
          text: `¡𝗕𝗶𝗲𝗻𝗩𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗚𝗿𝘂𝗽𝗼! @${onlyNumbers(userJid)} ¡Bienvenid@ al grupo! 🎉`,
          mentions: [userJid],
        });
      } else if (welcomeOption === '2') {
        // Obtener la foto de perfil de la persona que se une
        const profilePicUrl = await socket.profilePictureUrl(userJid, "image");

        // Enviar foto de perfil con mensaje de bienvenida
        await socket.sendMessage(remoteJid, {
          image: { url: profilePicUrl },
          caption: `¡𝗕𝗶𝗲𝗻𝗩𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗚𝗿𝘂𝗽𝗼! @${onlyNumbers(userJid)} ¡Bienvenid@ al grupo! 🎉`,
          mentions: [userJid],
        });
      }
    } catch (error) {
      warningLog(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de Bienvenida"
      );
    }
  } else if (groupParticipantsUpdate.action === "remove") {
    // Aquí podrías agregar un mensaje de despedida si es necesario
  }
};