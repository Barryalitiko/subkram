const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const usageStatsFilePath = path.resolve(process.cwd(), "assets/usageStats.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error al escribir en el archivo ${filePath}: ${error.message}`);
  }
};

module.exports = {
  name: "reclamar",
  description: "Reclama 5 monedas diarias.",
  commands: ["reclamar"],
  usage: `${PREFIX}reclamar`,
  handle: async ({ sendReply, userJid }) => {
    const usageStats = readData(usageStatsFilePath);
    const krData = readData(krFilePath);

    // Obtener la fecha de la última reclamación
    const lastClaimDate = usageStats.users?.[userJid]?.lastClaim || null;
    const today = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

    // Si el usuario ya reclamó hoy, mostrar un mensaje
    if (lastClaimDate === today) {
      await sendReply("❌ Ya has reclamado tus monedas hoy. Vuelve mañana.");
      return;
    }

    // Agregar usuario a kr.json si no existe
    let userKr = krData.find(entry => entry.userJid === userJid);
    if (!userKr) {
      userKr = { userJid, kr: 0 };
      krData.push(userKr);
    }

    // Sumar 5 monedas al usuario
    userKr.kr += 5;
    writeData(krFilePath, krData.map(entry => (entry.userJid === userJid ? userKr : entry)));

    // Registrar la fecha de la última reclamación
    if (!usageStats.users) usageStats.users = {};
    usageStats.users[userJid] = { lastClaim: today };
    writeData(usageStatsFilePath, usageStats);

    // Mensaje de confirmación
    await sendReply(`🎁 Has reclamado 5 monedas diarias. 💰 Tu saldo actual es: ${userKr.kr} 𝙺𝚛.`);
  },
};