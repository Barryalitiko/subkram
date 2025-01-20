const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { warningLog } = require("../utils/logger");
const path = require("path");

const welcomeConfigPath = path.resolve(__dirname, "../../assets/welcome-config.json");

function getWelcomeConfig() {
  if (!fs.existsSync(welcomeConfigPath)) {
    fs.writeFileSync(welcomeConfigPath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(welcomeConfigPath, "utf8"));
}

exports.onGroupParticipantsUpdate = async ({
  groupParticipantsUpdate,
  socket,
}) => {
  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];
  const config = getWelcomeConfig();
  const welcomeOption = config[remoteJid]; // 0: no photo, 1: with message, 2: with photo

  if (groupParticipantsUpdate.action === "add") {
    try {
      // Si la bienvenida está apagada (opción 0), no se envía nada
      if (welcomeOption === "0") {
        return;
      }

      // Si la bienvenida está configurada para enviar mensaje sin foto (opción 1)
      if (welcomeOption === "1") {
        await socket.sendMessage(remoteJid, {
          text: `¡𝗕𝗶𝗲𝗻𝗩𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼! 
@${onlyNumbers(userJid)}

> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎
> https://t.me/krampusiano`,
          mentions: [userJid],
        });
      }

      // Si la bienvenida está configurada para enviar foto de perfil con mensaje (opción 2)
      if (welcomeOption === "2") {
        try {
          // Obtener la URL de la foto de perfil del usuario
          const profilePicUrl = await socket.profilePictureUrl(userJid, "image");

          // Descargar la imagen
          const buffer = await socket.downloadMediaMessage(profilePicUrl);

          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: `¡𝗕𝗶𝗲𝗻𝗩𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼!
@${onlyNumbers(userJid)}
𝘗𝘳𝘦𝘴𝘦𝘯𝘵𝘢𝘵𝘦 ᶜᵒⁿ 𝐟𝐨𝐭𝐨 y 𝐧𝐨𝐦𝐛𝐫𝐞 

> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎
> https://t.me/krampusiano`,
            mentions: [userJid],
          });
        } catch (error) {
          warningLog("No se pudo obtener o enviar la foto de perfil.");
        }
      }
    } catch (error) {
      warningLog(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de Bienvenida"
      );
    }
  }
};