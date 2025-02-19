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
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error al escribir en el archivo ${filePath}: ${error.message}`);
  }
};

module.exports = {
  name: "apuesta_caballos",
  description: "Apuesta en una carrera de caballos y gana monedas.",
  commands: ["apuesta"],
  usage: `${PREFIX}apuesta_caballos <caballo> <cantidad>`,
  handle: async ({ sendReply, userJid, args }) => {
    const commandStatus = readData(commandStatusFilePath);
    if (commandStatus.commandStatus !== "on") {
      await sendReply("❌ El sistema de apuestas de caballos está desactivado.");
      return;
    }

    const usageStats = readData(usageStatsFilePath);
    const userStats = usageStats.users?.[userJid] || { attempts: 0 };

    if (userStats.attempts >= 3) {
      await sendReply("❌ Ya has alcanzado el límite de intentos diarios en las apuestas de caballos.");
      return;
    }

    let krData = readData(krFilePath);
    let userKr = krData.find(entry => entry.userJid === userJid);

    if (!userKr) {
      userKr = { userJid, kr: 0 };
      krData.push(userKr);
      writeData(krFilePath, krData);
    }

    if (userKr.kr < 10) {
      await sendReply("❌ No tienes suficientes monedas para apostar. Necesitas al menos 10.");
      return;
    }

    const selectedHorse = parseInt(args[0]);
    const betAmount = parseInt(args[1]);

    if (![1, 2, 3].includes(selectedHorse)) {
      await sendReply("❌ Opción inválida. Elige un caballo: 1️⃣, 2️⃣ o 3️⃣.");
      return;
    }

    if (isNaN(betAmount) || betAmount < 10 || betAmount > userKr.kr) {
      await sendReply("❌ Apuesta inválida. Asegúrate de apostar al menos 10 monedas y no más de tu saldo.");
      return;
    }

    userKr.kr -= betAmount;
    krData = krData.map(entry => (entry.userJid === userJid ? userKr : entry));
    writeData(krFilePath, krData);

    userStats.attempts += 1;
    usageStats.users[userJid] = userStats;
    writeData(usageStatsFilePath, usageStats);

    await sendReply("🏇 ¡La carrera comienza! 🏇💨");
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendReply("🏇💨 Los caballos están corriendo a toda velocidad... 🏁");
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendReply("🏁 ¡Ya casi llegan a la meta! 🏁");

    const winner = Math.floor(Math.random() * 3) + 1;
    let resultMessage;
    let ganancia = 0;

    if (selectedHorse === winner) {
      ganancia = betAmount * 0.15;
      userKr.kr += betAmount + ganancia;
      resultMessage = `🎉 ¡Tu caballo **${selectedHorse}** ganó! Has ganado **${ganancia.toFixed(2)} monedas**.`;
    } else if (Math.abs(selectedHorse - winner) === 1) {
      resultMessage = `😐 Tu caballo **${selectedHorse}** quedó en segundo lugar. No ganaste ni perdiste monedas.`;
      userKr.kr += betAmount;
    } else {
      resultMessage = `❌ Tu caballo **${selectedHorse}** perdió la carrera. Has perdido **${betAmount} monedas**.`;
    }

    krData = krData.map(entry => (entry.userJid === userJid ? userKr : entry));
    writeData(krFilePath, krData);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendReply(resultMessage);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendReply(`💰 Tu saldo final es: **${userKr.kr} monedas**`);
  },
};