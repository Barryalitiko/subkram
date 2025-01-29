const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { getProfileImageData } = require("../services/baileys");
const { warningLog } = require("../utils/logger");
const path = require("path");

// Cargar el archivo JSON de configuración de bienvenida
const welcomeConfigPath = path.resolve(process.cwd(), "assets/welcomeConfig.json");
// Función para obtener la configuración de bienvenida desde el archivo JSON
const getWelcomeConfig = (groupId) => {
try {
const data = fs.readFileSync(welcomeConfigPath, "utf-8");
const config = JSON.parse(data);
return config[groupId] || null;
} catch (error) {
warningLog("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 Error al leer el archivo de configuración de bienvenida", error);
return null;
}
};

exports.onGroupParticipantsUpdate = async ({ groupParticipantsUpdate, socket }) => {
  const { action, participants } = groupParticipantsUpdate;
  const groupId = groupParticipantsUpdate.remoteJid;
  const userJid = participants[0];

  // Obtener la configuración de bienvenida desde el archivo JSON
  const welcomeConfig = getWelcomeConfig(groupId);

  if (!welcomeConfig || !welcomeConfig.enabled) {
    return; // Si la bienvenida está desactivada, no hacer nada
  }

  const welcomeMode = welcomeConfig.mode; // Obtener el modo de bienvenida del JSON

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
          const { buffer: profileImageBuffer, profileImage } = await getProfileImageData(socket, userJid);
          buffer = profileImageBuffer;
        } catch {
          warningLog(
            "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo obtener la foto de perfil, usando imagen predeterminada"
          );
          buffer = null; // Si no se puede obtener la foto, puedes asignar un buffer predeterminado
        }
      }

      // Crear el mensaje de bienvenida
      const welcomeMessage = ` ¡𝗕𝗶𝗲𝗻𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼!
@${onlyNumbers(userJid)}
𝘗𝘳𝘦𝘴𝘦𝘯𝘵𝘢𝘵𝘦 ᶜᵒⁿ 𝐟𝐨𝐭𝐨 y 𝐧𝐨𝐦𝐛𝐫𝐞 

> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎
> https://t.me/krampusiano`;

      // Enviar mensaje según el modo
      if (welcomeMode === "1" && buffer) {
        await socket.sendMessage(groupId, {
          image: buffer,
          caption: welcomeMessage,
          mentions: [userJid],
        });
      } else if (welcomeMode === "2") {
        await socket.sendMessage(groupId, {
          text: welcomeMessage,
          mentions: [userJid],
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