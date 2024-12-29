const { getProfileImageData } = require("@whiskeysockets/baileys");
const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { isActiveWelcomeGroup } = require("../utils/database");
const { warningLog } = require("../utils/logger");
const GroupApproval = require("../models/GroupApproval");

exports.onGroupParticipantsUpdate = async ({
  groupParticipantsUpdate,
  socket,
}) => {
  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];

  if (!isActiveWelcomeGroup(remoteJid)) {
    return;
  }

  // Obtener el estado de la aprobación del grupo
  const groupApproval = await GroupApproval.findOne({ groupId: remoteJid });

  // Si la aprobación está activada, aprobamos la solicitud automáticamente
  if (groupApproval && groupApproval.approvalEnabled && groupParticipantsUpdate.action === "add") {
    try {
      // Aprobamos automáticamente la solicitud (sin necesidad de enviar mensaje de bienvenida)
      await socket.groupAdd(remoteJid, [userJid]);

      console.log(`Aprobada automáticamente la solicitud de ${userJid} en ${remoteJid}`);

      // Si necesitas hacer algo adicional (como guardar logs o notificaciones), lo puedes agregar aquí

    } catch (error) {
      warningLog(`👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo aprobar automáticamente la solicitud de ${userJid}`);
    }
  }

  // Si la acción es "add" y la aprobación no está activada, se sigue enviando el mensaje de bienvenida
  if (groupParticipantsUpdate.action === "add" && (!groupApproval || !groupApproval.approvalEnabled)) {
    try {
      const { buffer, profileImage } = await getProfileImageData(socket, userJid);

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
      warningLog("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de Bienvenida");
    }
  }

  // Mensaje de despedida para cuando un participante sale
  if (groupParticipantsUpdate.action === "remove") {
    try {
      const { buffer, profileImage } = await getProfileImageData(socket, userJid);

      await socket.sendMessage(remoteJid, {
        image: buffer,
        caption: ` ¡𝗙𝗲𝗹𝗶𝚌𝗲𝘀 𝗹𝗲𝗰𝗵𝗼𝘀 𝗮𝗹 𝗽𝗮𝗿𝗮𝗷𝗲!
@${onlyNumbers(userJid)}
𝘌𝘴𝘵𝘢𝘳𝗲𝗺𝘰𝘴 𝗮𝗹 𝗮𝗷𝘂𝘴𝘁𝗲, 𝘧𝘶𝘦𝗿𝗼 𝗮 𝗰𝗹𝗮𝘀𝗲 𝘥𝗲 𝗿𝗮𝗯𝗶𝗮 𝗽𝘂𝗲𝗱𝗲 𝗲𝘀𝘁𝗮𝗿 𝗮𝗻𝗾𝘂𝗲𝘀 𝘁𝘂 𝘀𝗲𝗿𝗶𝗮 🧠 𝘌𝘴𝘵𝘦 𝘢 𝘮𝘰𝘳𝘪𝘳 𝗻𝘂𝗲𝘀𝘁𝗿𝗮.`,
        mentions: [userJid],
      });

      if (!profileImage.includes("default-user")) {
        fs.unlinkSync(profileImage);
      }
    } catch (error) {
      warningLog("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de despedida");
    }
  }
};