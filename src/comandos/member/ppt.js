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

module.exports = {
  name: "ppt",
  description: "Juega piedra, papel o tijera apostando monedas.",
  commands: ["ppt"],
  usage: `${PREFIX}ppt <piedra|papel|tijera> <cantidad>`,
  handle: async ({ sendReply, userJid, args }) => {
    const commandStatus = readData(commandStatusFilePath);
    if (commandStatus.commandStatus !== "on") {
      await sendReply("❌ El juego de Piedra, Papel o Tijera está desactivado.");
      return;
    }

    if (args.length < 2) {
      await sendReply(`❌ Uso incorrecto. Ejemplo: ${PREFIX}ppt piedra 10`);
      return;
    }

    const userChoice = args[0].toLowerCase();
    const betAmount = parseInt(args[1]);

    if (!["piedra", "papel", "tijera"].includes(userChoice)) {
      await sendReply("❌ Debes elegir entre 'piedra', 'papel' o 'tijera'.");
      return;
    }

    if (isNaN(betAmount) || betAmount <= 0) {
      await sendReply("❌ Debes ingresar una cantidad válida de monedas para apostar.");
      return;
    }

    const usageStats = readData(usageStatsFilePath);
    const userStats = usageStats.users?.[userJid] || { attempts: 0 };

    if (userStats.attempts >= 3) {
      await sendReply("❌ Ya has alcanzado el límite de intentos diarios.");
      return;
    }

    let krData = readData(krFilePath);
    let userKr = krData.find(entry => entry.userJid === userJid);

    if (!userKr) {
      userKr = { userJid, kr: 0 };
      krData.push(userKr);
      writeData(krFilePath, krData);
    }

    if (userKr.kr < betAmount) {
      await sendReply("❌ No tienes suficientes monedas para esta apuesta.");
      return;
    }

    userStats.attempts += 1;
    usageStats.users = usageStats.users || {};
    usageStats.users[userJid] = userStats;
    writeData(usageStatsFilePath, usageStats);

    const choices = ["piedra", "papel", "tijera"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    await sendReply("🤔 Pensando...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendReply(`🤖 Yo elijo: *${botChoice}*`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    let resultMessage = "";
    let winnings = 0;

    if (userChoice === botChoice) {
      resultMessage = "🤝 ¡Empate! No ganas ni pierdes monedas.";
    } else if (
      (userChoice === "piedra" && botChoice === "tijera") ||
      (userChoice === "papel" && botChoice === "piedra") ||
      (userChoice === "tijera" && botChoice === "papel")
    ) {
      winnings = betAmount * 2;
      userKr.kr += betAmount;
      resultMessage = `🏆 ¡Ganaste! Has obtenido *${betAmount} monedas extra*.`;
    } else {
      userKr.kr -= betAmount;
      resultMessage = `❌ Perdiste... Has perdido *${betAmount} monedas*.`;
    }

    krData = krData.map(entry => (entry.userJid === userJid ? userKr : entry));
    writeData(krFilePath, krData);

    await sendReply(resultMessage);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendReply(`💰 Tu saldo actual es: ${userKr.kr} 𝙺𝚛`);
  },
};