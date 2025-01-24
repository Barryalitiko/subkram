const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const marriageFilePath = path.resolve(process.cwd(), "assets/marriage.json");
const krFilePath = path.resolve(process.cwd(), "assets/kr.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error al escribir en el archivo ${filePath}: ${error.message}`);
  }
};

const assignInitialKr = (userJid) => {
  const krData = readData(krFilePath);
  if (!krData.find(entry => entry.userJid === userJid)) {
    krData.push({ userJid, kr: 50 });
    writeData(krFilePath, krData);
  }
};

module.exports = {
  name: "data",
  description: "Ver tu información matrimonial y estado actual.",
  commands: ["data"],
  usage: `${PREFIX}data`,
  handle: async ({ sendReply, userJid }) => {
    assignInitialKr(userJid);
    const marriageData = readData(marriageFilePath);
    const krData = readData(krFilePath);

    if (krData && krData.length > 0) {
      const userKr = krData.find(entry => entry.userJid === userJid);
      const userKrBalance = userKr ? userKr.kr : 0;

      const marriage = marriageData.find(entry => entry.userJid === userJid || entry.partnerJid === userJid);
      if (!marriage) {
        const noMarriageInfo = ` ❌ **No estás casado.** 💸 **Tus monedas 𝙺𝚛:** ${userKrBalance} `;
        await sendReply(noMarriageInfo);
        return;
      }

      const { partnerJid, date, groupId, dailyLove } = marriage;
      const partnerName = partnerJid.split("@")[0];
      const marriageDate = new Date(date);
      const currentDate = new Date();
      const daysMarried = Math.floor((currentDate - marriageDate) / (1000 * 60 * 60 * 24));

      const marriageInfo = ` 💍 **Estado Matrimonial: Casado** 👰 **Pareja:** @${partnerName} 📅 **Fecha de Casamiento:** ${marriageDate.toLocaleDateString()} 🗓️ **Días Casados:** ${daysMarried} días 🏠 **Grupo:** ${groupId} 💖 **Amor Diario:** ${dailyLove} mensajes diarios 💸 **Tus monedas 𝙺𝚛:** ${userKrBalance} `;
      await sendReply(marriageInfo);
    }
  },
};
