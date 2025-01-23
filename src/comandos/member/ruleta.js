const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus"); // Asegúrate de tener el archivo de configuración correctamente importado

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const usageStatsFilePath = path.resolve(process.cwd(), "assets/usageStats.json");

// Función para leer los datos del archivo JSON
const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    return []; // Si no hay datos, retornar un array vacío
  }
};

// Función para escribir los datos en el archivo JSON
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "ruleta",
  description: "Gira la ruleta y prueba tu suerte",
  commands: ["ruleta"],
  usage: `${PREFIX}ruleta`,
  handle: async ({ sendReply, userJid }) => {
    // Leer los datos de monedas
    let krData = readData(krFilePath);

    // Asegurarse de que el usuario tiene un objeto en el archivo de monedas
    let userKr = krData.find(user => user.userJid === userJid);
    if (!userKr) {
      // Si el usuario no está en kr.json, agregarlo con 50 monedas
      userKr = { userJid, kr: 50 };
      krData.push(userKr);
      writeData(krFilePath, krData);
    }

    // Lógica de ruleta (la que ya tienes)
    const maxUses = 3;
    const usageStatsData = readData(usageStatsFilePath);
    const userStats = usageStatsData.find(user => user.userJid === userJid) || { uses: 0 };

    if (userStats.uses >= maxUses) {
      await sendReply("❌ Ya has alcanzado el límite de usos para hoy.");
      return;
    }

    // Lógica de la ruleta y actualización de las monedas
    const possibleOutcomes = [1, 2, 3, -2, -4]; // Posibles resultados de ganar o perder monedas
    const outcome = possibleOutcomes[Math.floor(Math.random() * possibleOutcomes.length)];

    // Sumar o restar monedas
    userKr.kr += outcome;
    writeData(krFilePath, krData);

    // Asegurarse de que el usuario no tenga menos de 0 monedas
    if (userKr.kr < 0) userKr.kr = 0;

    // Actualizar estadísticas de uso
    if (!userStats.userJid) {
      userStats.userJid = userJid;
      usageStatsData.push(userStats);
    }
    userStats.uses++;
    writeData(usageStatsFilePath, usageStatsData);

    // Responder al usuario
    await sendReply(`🎲 Probando tu suerte...`);
    await sendReply(`💨`);
    await sendReply(`🎲`);

    await sendReply(`Resultado: ${outcome > 0 ? "+" : ""}${outcome} 𝙺𝚛. Ahora tienes ${userKr.kr} 𝙺𝚛.`);
  },
};