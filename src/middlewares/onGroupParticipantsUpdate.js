const { getProfileImageData } = require("../services/baileys");
const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { isActiveWelcomeGroup } = require("../utils/database");
const { warningLog } = require("../utils/logger");

exports.onGroupParticipantsUpdate = async ({
  groupParticipantsUpdate,
  socket,
}) => {
  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];

  if (!isActiveWelcomeGroup(remoteJid)) {
    return;
  }

  if (groupParticipantsUpdate.action === "add") {
    // Si alguien entra al grupo
    try {
      const { buffer, profileImage } = await getProfileImageData(
        socket,
        userJid
      );

      await socket.sendMessage(remoteJid, {
        image: buffer,
        caption: ` ¡𝗕𝗶𝗲𝗻𝘃𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼!
@${onlyNumbers(userJid)}
𝘗𝘳𝘦𝘴𝘦𝘯𝘵𝘢𝘵𝘦 ᶜᵒⁿ 𝐟𝐨𝐭𝐨 y 𝐧𝐨𝐦𝐛𝐫𝐞 

> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎
> https://t.me/krampusiano`,
        mentions: [userJid],
      });

      if (!profileImage.includes("default-user")) {
        fs.unlinkSync(profileImage);
      }
    } catch (error) {
      warningLog(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de Bienvenida"
      );
    }
  } else if (groupParticipantsUpdate.action === "remove") {
    // Si alguien sale del grupo
    try {
      const { buffer, profileImage } = await getProfileImageData(
        socket,
        userJid
      );

      await socket.sendMessage(remoteJid, {
        image: buffer,
        caption: ` ¡𝗙𝗲𝗹𝗶𝚌𝗲𝘀 𝗹𝗲𝗰𝗵𝗼𝘀 𝗮𝗹 𝗽𝗮𝗿𝗮𝗷𝗲!
@${onlyNumbers(userJid)}
𝘌𝘴𝘵𝘢𝘳𝗲𝗺𝘰𝘴 𝗮𝗹 𝗮𝗷𝘂𝘀𝘁𝗲, 𝘧𝘶𝘦𝗿𝗼 𝗮 𝗰𝗹𝗮𝘀𝗲 𝘥𝗲 𝗿𝗮𝗯𝗶𝗮 𝗽𝘂𝗲𝗱𝗲 𝗲𝘀𝘁𝗮𝗿 𝗮𝗻𝗾𝘂𝗲𝘀 𝘁𝘂 𝘀𝗲𝗿𝗶𝗮 🧠 𝘌𝘴𝘵𝘦 𝘢 𝘮𝘰𝘳𝘪𝘳 𝗻𝘂𝗲𝘀𝘁𝘳𝗮.` ,
        mentions: [userJid],
      });

      if (!profileImage.includes("default-user")) {
        fs.unlinkSync(profileImage);
      }
    } catch (error) {
      warningLog(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de despedida"
      );
    }
  }
};
