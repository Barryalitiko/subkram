const fs = require("fs");
const path = require("path");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");

// Función para leer los datos de kr.json
const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

// Función para escribir datos en kr.json
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Función para asignar monedas a nuevos usuarios
const assignInitialKr = (userJid) => {
  const krData = readData(krFilePath);

  // Verificar si el usuario ya tiene un registro
  const userData = krData.find(entry => entry.userJid === userJid);

  if (!userData) {
    // Si no tiene un registro, se le asignan 50 monedas
    krData.push({
      userJid,
      kr: 50
    });

    // Guardar el nuevo estado en el archivo
    writeData(krFilePath, krData);
  }
};

module.exports = {
  name: "data",
  description: "Ver tu información matrimonial y estado actual.",
  commands: ["data"],
  usage: `${PREFIX}data`,
  handle: async ({ sendReply, userJid }) => {
    // Asignar monedas 𝙺𝚛 si es necesario
    assignInitialKr(userJid);

    const marriageData = readData(marriageFilePath);
    const krData = readData(krFilePath);

    // Buscar si el usuario está casado
    const marriage = marriageData.find(
      (entry) => entry.userJid === userJid || entry.partnerJid === userJid
    );

    const userKr = krData.find(entry => entry.userJid === userJid);
    const userKrBalance = userKr ? userKr.kr : 0;

    if (!marriage) {
      const noMarriageInfo = `
        ❌ **No estás casado.**
        💸 **Tus monedas 𝙺𝚛:** ${userKrBalance}
      `;
      await sendReply(noMarriageInfo);
      return;
    }

    const { partnerJid, date, groupId, dailyLove } = marriage;
    const partnerName = partnerJid.split("@")[0];
    const marriageDate = new Date(date);
    const currentDate = new Date();
    const daysMarried = Math.floor((currentDate - marriageDate) / (1000 * 60 * 60 * 24));

    const marriageInfo = `
      💍 **Estado Matrimonial: Casado**
      👰 **Pareja:** @${partnerName}
      📅 **Fecha de Casamiento:** ${marriageDate.toLocaleDateString()}
      🗓️ **Días Casados:** ${daysMarried} días
      🏠 **Grupo:** ${groupId}
      💖 **Amor Diario:** ${dailyLove} mensajes diarios
      💸 **Tus monedas 𝙺𝚛:** ${userKrBalance}
    `;

    await sendReply(marriageInfo);
  },
};