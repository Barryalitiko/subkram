const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { getWelcomeMode } = require("../utils/database");
const { warningLog } = require("../utils/logger");
const { isActiveAutoApproveGroup } = require("../../utils/database");

exports.onGroupParticipantsUpdate = async ({ groupParticipantsUpdate, socket }) => {
  const { action, participants } = groupParticipantsUpdate;
  const groupId = groupParticipantsUpdate.remoteJid;

  // Verificamos si el auto-aprobado está activo para el grupo
  if (isActiveAutoApproveGroup(groupId) && action === "add") {
    // Aprobamos automáticamente a los nuevos miembros
    for (let userJid of participants) {
      await socket.sendMessage(groupId, {
        text: `✅ Se ha aprobado automáticamente a @${userJid}`,
        mentions: [userJid],
      });
    }
  }

  // Obtener el modo de bienvenida
  const welcomeMode = getWelcomeMode(groupId);

  // Si el modo de bienvenida es 0, está desactivado
  if (welcomeMode === "0") {
    return;
  }

  // Cuando alguien se une al grupo
  if (action === "add") {
    try {
      let buffer = null;

      // Si el modo es 1 (con foto), obtenemos la imagen de perfil
      if (welcomeMode === "1") {
        try {
          const profilePictureUrl = await socket.profilePictureUrl(participants[0], "image");
          const response = await fetch(profilePictureUrl);
          buffer = await response.buffer();
        } catch {
          warningLog(
            "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo obtener la foto de perfil, usando imagen predeterminada"
          );
          buffer = null; // Puede manejarse un buffer predeterminado si es necesario
        }
      }

      // Crear el mensaje de bienvenida
      const welcomeMessage = ` ¡𝗕𝗶𝗲𝗻𝘃𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼!
@${onlyNumbers(participants[0])}
𝘗𝘳𝘦𝘴𝘦𝘯𝘵𝘢𝘵𝘦 ᶜᵒⁿ 𝐟𝐨𝐭𝐨 y 𝐧𝐨𝐦𝐛𝐫𝐞 

> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎
> https://t.me/krampusiano`;

      // Enviar mensaje según el modo
      if (welcomeMode === "1" && buffer) {
        await socket.sendMessage(groupId, {
          image: buffer,
          caption: welcomeMessage,
          mentions: [participants[0]],
        });
      } else if (welcomeMode === "2") {
        await socket.sendMessage(groupId, {
          text: welcomeMessage,
          mentions: [participants[0]],
        });
      }
    } catch (error) {
      warningLog(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de bienvenida",
        error
      );
    }
  }
};