const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { getProfileImageData } = require("../services/baileys");
const { warningLog } = require("../utils/logger");
const path = require("path");

const welcomeConfigPath = path.resolve(process.cwd(), "assets/welcomeConfig.json");

const getWelcomeConfig = (groupId) => {
try {
const data = fs.readFileSync(welcomeConfigPath, "utf-8");
const config = JSON.parse(data);
return config[groupId] || null;
} catch (error) {
warningLog("Error al leer archivo de configuración de bienvenida", error);
return null;
}
};

exports.onGroupParticipantsUpdate = async ({ groupParticipantsUpdate, socket }) => {
const groupId = groupParticipantsUpdate.id;
const userJid = groupParticipantsUpdate.participants[0];

const welcomeConfig = getWelcomeConfig(groupId);
if (!welcomeConfig || !welcomeConfig.enabled) {
return;
}

if (groupParticipantsUpdate.action === "add") {
try {
const { buffer, profileImage } = await getProfileImageData(socket, userJid);
const welcomeMessage = `¡𝗕𝗶𝗲𝗻𝘃𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼! @${onlyNumbers(userJid)} 𝘗𝘳𝘦𝘴𝘦𝘯𝘵𝘢𝘯ᶜᵒⁿ 𝐟𝐨𝐭𝐨 y 𝐧𝐨𝐦𝐛𝐫𝐞 > Bot by Krampus OM Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎ > https://t.me/krampusiano`;
await socket.sendMessage(groupId, {
image: buffer,
caption: welcomeMessage,
mentions: [userJid],
});
if (!profileImage.includes("default-user")) {
fs.unlinkSync(profileImage);
}
} catch (error) {
warningLog("Error al enviar mensaje de bienvenida", error);
}
}
};

