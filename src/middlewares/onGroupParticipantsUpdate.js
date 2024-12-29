const { getProfileImageData } = require("@whiskeysockets/baileys");
const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { warningLog } = require("../utils/logger");
const path = require("path");

// Ruta al archivo JSON donde se almacenan las configuraciones
const approvalConfigPath = path.join(__dirname, "../data/groupApprovalConfig.json");

const readApprovalConfig = () => {
  if (fs.existsSync(approvalConfigPath)) {
    const rawData = fs.readFileSync(approvalConfigPath);
    return JSON.parse(rawData);
  }
  return {};
};

const writeApprovalConfig = (data) => {
  fs.writeFileSync(approvalConfigPath, JSON.stringify(data, null, 2));
};

exports.onGroupParticipantsUpdate = async ({
  groupParticipantsUpdate,
  socket,
}) => {
  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];

  // Leer la configuración de aprobación de solicitudes
  const groupApprovalConfig = readApprovalConfig();
  const approvalEnabled = groupApprovalConfig[remoteJid]?.approvalEnabled;

  if (groupParticipantsUpdate.action === "add") {
    if (approvalEnabled) {
      // Si la aprobación está activada, aprobamos automáticamente la solicitud
      try {
        await socket.groupAdd(remoteJid, [userJid]);
        console.log(`Aprobada automáticamente la solicitud de ${userJid} en ${remoteJid}`);
      } catch (error) {
        warningLog(`👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo aprobar automáticamente la solicitud de ${userJid}`);
      }
    } else {
      // Si la aprobación está desactivada, enviamos el mensaje de bienvenida
      try {
        const { buffer, profileImage } = await getProfileImageData(socket, userJid);

        await socket.sendMessage(remoteJid, {
          image: buffer,
          caption: ` ¡𝗕𝗶𝗲𝗻𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼!
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
  }

  // Mensaje de despedida para cuando un participante sale
  if (groupParticipantsUpdate.action === "remove") {
    try {
      const { buffer, profileImage } = await getProfileImageData(socket, userJid);

      await socket.sendMessage(remoteJid, {
        image: buffer,
        caption: ` ¡𝗙𝗲𝗹𝗶𝚌𝗲𝘀 𝗹𝗲𝗰𝗵𝗼𝘀 𝗮𝗹 𝗽𝗮𝗿𝗮𝗷𝗲!
@${onlyNumbers(userJid)}
𝘌𝘴𝘵𝘢𝘳𝗲𝗺𝘰𝘴 𝗮𝗹 𝗮𝗷𝘂𝘴𝘁𝗲, 𝘧𝘶𝘦𝗿𝗼 𝗮 𝗰𝗹𝗮𝘀𝗲 𝘥𝗲 𝗿𝗮𝗯𝗶𝗮 𝗽𝘂𝗲𝗱𝗲 𝗲𝘀𝘁𝗮𝗿 𝗮𝗻𝗾𝘂𝗲𝘴 𝘁𝘂 𝘀𝗲𝗿𝗶𝗮 🧠 𝘌𝘴𝘵𝘦 𝘢 𝘮𝘰𝘳𝘪𝘳 𝗻𝘂𝗲𝘀𝘁𝗿𝗮.`,
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