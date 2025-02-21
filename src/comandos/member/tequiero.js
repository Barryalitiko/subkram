const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const marriageFilePath = path.resolve(process.cwd(), "assets/marriage.json");

// Función para leer datos JSON
const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

// Función para escribir datos JSON
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "tequiero",
  description: "Expresa amor a tu pareja y mantén una racha diaria.",
  commands: ["tequiero"],
  usage: `${PREFIX}tequiero`,
  handle: async ({ socket, sendReply, userJid, remoteJid }) => {
    let marriageData = readData(marriageFilePath);
    let userMarriage = marriageData.find(entry => entry.userJid === userJid || entry.partnerJid === userJid);

    if (!userMarriage) {
      await sendReply("❌ No tienes pareja. Encuentra el amor antes de usar este comando.");
      return;
    }

    let { userJid: partner1, partnerJid: partner2, loveStreak, hearts, lastUsed } = userMarriage;
    let partnerJid = userJid === partner1 ? partner2 : partner1;
    let today = new Date().toISOString().split("T")[0];

    if (lastUsed === today) {
      await sendReply("💖 Ya expresaste tu amor hoy. Vuelve mañana para mantener la racha.");
      return;
    }

    // Si se usa al día siguiente, la racha sube; si se rompe la cadena, se reinicia
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastUsed === yesterdayStr) {
      loveStreak += 1;
    } else {
      loveStreak = 1;
    }

    hearts += 1; // Se acumulan corazones
    userMarriage.loveStreak = loveStreak;
    userMarriage.hearts = hearts;
    userMarriage.lastUsed = today;

    writeData(marriageFilePath, marriageData);

    let message = `❤️ @${partnerJid.split("@")[0]}, tu pareja @${userJid.split("@")[0]} te ha dicho #tequiero.\n`;
    message += `🔥 Racha de amor: ${loveStreak} días\n💖 Corazones acumulados: ${hearts}\n`;
    message += `No olviden mantener la llama viva cada día.`;

    await socket.sendMessage(remoteJid, { text: message, mentions: [userJid, partnerJid] });
  },
};