const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus"); // Asegúrate de que esta línea esté correctamente importada
const usageStatsFilePath = path.resolve(process.cwd(), "assets/usageStats.json");
const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const monedasFilePath = path.resolve(process.cwd(), "assets/monedas.json");

// Función para leer datos
const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
};

// Función para escribir datos
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: "ruleta",
  description: "Prueba tu suerte diaria. Solo podrás jugar 3 veces al día.",
  commands: ["ruleta"],
  usage: `${PREFIX}ruleta`,
  handle: async ({ sendReply, userJid }) => {
    const usageStats = readData(usageStatsFilePath);
    const krData = readData(krFilePath);
    const monedasData = readData(monedasFilePath);

    // Verificar si el comando de ruleta está habilitado
    const commandStatus = monedasData.commandStatus?.enabled;
    if (!commandStatus) {
      await sendReply("❌ El comando está desactivado.");
      return;
    }

    // Verificar si el usuario ya jugó 3 veces hoy
    const userStats = usageStats.users[userJid] || { todayPlays: 0, lastPlayDate: "" };
    const currentDate = new Date().toLocaleDateString();
    const lastPlayDate = new Date(userStats.lastPlayDate).toLocaleDateString();

    if (currentDate !== lastPlayDate) {
      userStats.todayPlays = 0; // Reseteamos las jugadas al nuevo día
    }

    if (userStats.todayPlays >= 3) {
      await sendReply("❌ Has alcanzado el límite de jugadas diarias.");
      return;
    }

    // Incrementar la jugada del usuario
    userStats.todayPlays += 1;
    userStats.lastPlayDate = new Date().toISOString();
    usageStats.users[userJid] = userStats;
    writeData(usageStatsFilePath, usageStats);

    // Simular el juego de ruleta
    await sendReply("🎲 Probando tu suerte diaria...");
    await sendReply("🎲");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
    await sendReply("💨");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
    await sendReply("🎲");

    // Determinar el resultado de la ruleta
    const outcomes = [1, 2, 3, -2, -4]; // 1, 2, 3 monedas ganadas, -2, -4 monedas perdidas
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    // Modificar las monedas del usuario según el resultado
    const userKr = krData.users[userJid] || { kr: 50 }; // Monedas base de 50
    userKr.kr += randomOutcome;

    // Asegurarnos de que no se tengan monedas negativas
    if (userKr.kr < 0) {
      userKr.kr = 0;
    }

    krData.users[userJid] = userKr;
    writeData(krFilePath, krData);

    // Enviar el resultado al usuario
    if (randomOutcome > 0) {
      await sendReply(`🎉 ¡Has ganado ${randomOutcome} monedas!`);
    } else {
      await sendReply(`💔 ¡Has perdido ${Math.abs(randomOutcome)} monedas!`);
    }

    await sendReply(`💰 Tu saldo actual de 𝙺𝚛 es: ${userKr.kr}`);
  },
};