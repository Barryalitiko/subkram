const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const commandStatusFilePath = path.resolve(process.cwd(), "assets/monedas.json");
const usageStatsFilePath = path.resolve(process.cwd(), "assets/usageStats.json");
const krFilePath = path.resolve(process.cwd(), "assets/kr.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "ruleta",
  description: "Juega a la ruleta y gana o pierde monedas.",
  commands: ["ruleta"],
  usage: `${PREFIX}ruleta`,
  handle: async ({ sendReply, userJid }) => {
    // Verificar si la ruleta está activada
    const commandStatus = readData(commandStatusFilePath);
    if (commandStatus.commandStatus !== "on") {
      await sendReply("❌ El sistema de ruleta está desactivado.");
      return;
    }

    // Verificar intentos del usuario
    const usageStats = readData(usageStatsFilePath);
    const userStats = usageStats.users[userJid] || { attempts: 0 };
    if (userStats.attempts >= 3) {
      await sendReply("❌ Ya has alcanzado el límite de intentos diarios en la ruleta.");
      return;
    }

    // Aumentar los intentos del usuario
    userStats.attempts += 1;
    usageStats.users[userJid] = userStats;
    writeData(usageStatsFilePath, usageStats);

    await sendReply("🎲 Probando tu suerte...");
    await sendReply("🎲");

    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendReply("💨");

    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendReply("🎲");

    // Resultados aleatorios: ganar 1, 2, 3 o perder 2, 4 monedas
    const result = Math.random();
    let amount = 0;
    if (result < 0.25) {
      amount = 1; // Ganar 1 moneda
    } else if (result < 0.5) {
      amount = 2; // Ganar 2 monedas
    } else if (result < 0.75) {
      amount = 3; // Ganar 3 monedas
    } else if (result < 0.875) {
      amount = -2; // Perder 2 monedas
    } else {
      amount = -4; // Perder 4 monedas
    }

    // Actualizar las monedas del usuario
    const krData = readData(krFilePath);
    const userKr = krData.users[userJid];
    if (!userKr) {
      // Si el usuario no tiene un registro, crear uno con un saldo inicial de 0
      krData.users[userJid] = { kr: 0 };
      writeData(krFilePath, krData);
      userKr = krData.users[userJid];
    }

    userKr.kr += amount;
    writeData(krFilePath, krData);

    // Mostrar el resultado
    if (amount > 0) {
      await sendReply(`🎉 ¡Has ganado ${amount} monedas! 🎉`);
    } else if (amount < 0) {
      await sendReply(`😢 ¡Has perdido ${Math.abs(amount)} monedas! 😢`);
    }
    await sendReply(`💰 Tu saldo actual es: ${userKr.kr} 𝙺𝚛`);
  },
};
