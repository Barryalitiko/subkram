const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const marriageFilePath = path.resolve(process.cwd(), "assets/marriage.json");
const krFilePath = path.resolve(process.cwd(), "assets/kr.json"); // Ruta para el archivo de monedas

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
    const krData = readData(krFilePath); // Leemos el archivo de monedas

    // Buscar si el usuario está casado
    const marriage = marriageData.find(
      (entry) => entry.userJid === userJid || entry.partnerJid === userJid
    );

    // Buscar el saldo de monedas del usuario
    const krUser = krData.find((entry) => entry.userJid === userJid);

    if (!marriage) {
      await sendReply("❌ No estás casado.");
      return;
    }

    const { partnerJid, date, groupId, dailyLove } = marriage;
    const partnerName = partnerJid.split("@")[0];
    const marriageDate = new Date(date);
    const currentDate = new Date();
    const daysMarried = Math.floor((currentDate - marriageDate) / (1000 * 60 * 60 * 24));

    // Obtener el saldo de monedas (si no tiene, será 0)
    const userKr = krUser ? krUser.kr : 0;

    const marriageInfo = `
      💍 **Estado Matrimonial: Casado**
      👰 **Pareja:** @${partnerName}
      📅 **Fecha de Casamiento:** ${marriageDate.toLocaleDateString()}
      🗓️ **Días Casados:** ${daysMarried} días
      🏠 **Grupo:** ${groupId}
      💖 **Amor Diario:** ${dailyLove} mensajes diarios
      💰 **Saldo de Monedas:** ${userKr} 𝙆𝚛
    `;

    await sendReply(marriageInfo);
  },
};