const fs = require("fs");
const path = require("path");

const { PREFIX } = require("../../krampus");

const monedasFilePath = path.resolve(process.cwd(), "assets/monedas.json");
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
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: "ruleta",
  description: "Juega a la ruleta y prueba tu suerte para ganar o perder monedas.",
  commands: ["ruleta"],
  usage: `${PREFIX}ruleta`,
  handle: async ({ sendReply, userJid }) => {
    // Verificar si el comando está habilitado
    const commandStatus = readData(monedasFilePath).find(
      (entry) => entry.command === "ruleta"
    );

    if (!commandStatus || commandStatus.status === "apagado") {
      return sendReply("❌ La ruleta está desactivada actualmente.");
    }

    // Verificar cuántas veces el usuario ha jugado hoy
    const usageStats = readData(usageStatsFilePath);
    const userStats = usageStats.find((entry) => entry.userJid === userJid);
    const currentDate = new Date().toLocaleDateString();
    if (userStats && userStats.date === currentDate && userStats.uses >= 3) {
      return sendReply("❌ Ya has jugado 3 veces hoy. Vuelve mañana.");
    }

    // Generar el resultado de la ruleta
    const result = Math.floor(Math.random() * 100) + 1; // Número entre 1 y 100
    let message = "🎲 Probando tu suerte diaria... 🎲";

    let won = false;
    let amount = 0;

    if (result <= 25) {
      won = true;
      amount = 1; // Gana 1 moneda
    } else if (result <= 50) {
      won = true;
      amount = 2; // Gana 2 monedas
    } else if (result <= 75) {
      won = true;
      amount = 3; // Gana 3 monedas
    } else if (result <= 85) {
      won = false;
      amount = -2; // Pierde 2 monedas
    } else if (result <= 95) {
      won = false;
      amount = -4; // Pierde 4 monedas
    }

    // Reacción con emojis
    await sendReply(message);
    setTimeout(async () => {
      await sendReply("💨");
      setTimeout(async () => {
        await sendReply("🎲");
      }, 2000);
    }, 2000);

    // Actualizar las monedas del usuario
    const krData = readData(krFilePath);
    const user = krData.find((entry) => entry.userJid === userJid);
    if (!user) {
      return sendReply("❌ No se encontró tu perfil de monedas.");
    }

    user.balance += amount; // Sumar o restar monedas
    writeData(krFilePath, krData);

    // Actualizar los intentos de hoy en usageStats
    if (userStats) {
      userStats.uses += 1;
    } else {
      usageStats.push({
        userJid,
        date: currentDate,
        uses: 1,
      });
    }

    writeData(usageStatsFilePath, usageStats);

    // Mensaje de resultado
    if (won) {
      await sendReply(`🎉 ¡Felicidades! Has ganado ${amount} monedas.`);
    } else {
      await sendReply(`💔 Lo siento, has perdido ${Math.abs(amount)} monedas.`);
    }
  },
};