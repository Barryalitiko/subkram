const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const marriageFilePath = path.resolve(process.cwd(), "assets/marriage.json");
const krFilePath = path.resolve(process.cwd(), "assets/kr.json");

// Funciones para leer los datos
const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

module.exports = {
  name: "data",
  description: "Ver tu información matrimonial y estado actual.",
  commands: ["data"],
  usage: `${PREFIX}data`,
  handle: async ({ sendReply, userJid }) => {
    const marriageData = readData(marriageFilePath);
    const krData = readData(krFilePath);

    // Buscar si el usuario está casado
    const marriage = marriageData.find(
      (entry) => entry.userJid === userJid || entry.partnerJid === userJid
    );

    // Buscar la cantidad de 𝙺𝚛 del usuario
    const userKr = krData.find((entry) => entry.userJid === userJid);

    if (!marriage) {
      await sendReply("❌ No estás casado.");
      return;
    }

    const { partnerJid, date, groupId, dailyLove } = marriage;
    const partnerName = partnerJid.split("@")[0];
    const marriageDate = new Date(date);
    const currentDate = new Date();
    const daysMarried = Math.floor((currentDate - marriageDate) / (1000 * 60 * 60 * 24));

    // Verificar si el usuario tiene 𝙺𝚛
    const krAmount = userKr ? userKr.kr : 50; // Si no tiene entrada en kr.json, empieza con 50

    const marriageInfo = `
      💍 **Estado Matrimonial: Casado**
      👰 **Pareja:** @${partnerName}
      📅 **Fecha de Casamiento:** ${marriageDate.toLocaleDateString()}
      🗓️ **Días Casados:** ${daysMarried} días
      🏠 **Grupo:** ${groupId}
      💖 **Amor Diario:** ${dailyLove} mensajes diarios

      💰 **Monedas 𝙺𝚛:** ${krAmount} 𝙺𝚛
    `;

    await sendReply(marriageInfo);
  },
};