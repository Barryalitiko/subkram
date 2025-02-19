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
  name: "tragamonedas",
  description: "Juega a las tragamonedas y gana o pierde monedas.",
  commands: ["tragamonedas"],
  usage: `${PREFIX}tragamonedas`,
  handle: async ({ sendReply, userJid }) => {
    const commandStatus = readData(commandStatusFilePath);
    if (commandStatus.commandStatus !== "on") {
      await sendReply("❌ El sistema de tragamonedas está desactivado.");
      return;
    }

    const usageStats = readData(usageStatsFilePath);
    const userStats = usageStats.users?.[userJid] || { attempts: 0 };

    // Límite de intentos diarios
    if (userStats.attempts >= 4) {
      await sendReply("❌ Has alcanzado el límite de intentos diarios en el tragamonedas.");
      return;
    }

    // Leer el saldo de monedas del usuario
    let krData = readData(krFilePath);
    let userKr = krData.find(entry => entry.userJid === userJid);

    // Si el usuario no existe en kr.json, lo agregamos con 0 monedas
    if (!userKr) {
      userKr = { userJid, kr: 0 };
      krData.push(userKr);
      writeData(krFilePath, krData);
    }

    // Verificar si el usuario tiene monedas para jugar
    if (userKr.kr < 5) {
      await sendReply("❌ No tienes suficientes monedas para jugar. Necesitas 5 monedas para jugar.");
      return;
    }

    // Restar el costo del intento al saldo del usuario
    userKr.kr -= 5;
    krData = krData.map(entry => (entry.userJid === userJid ? userKr : entry));
    writeData(krFilePath, krData);

    // Aumentar los intentos
    userStats.attempts += 1;
    usageStats.users[userJid] = userStats;
    writeData(usageStatsFilePath, usageStats);

    // Definir los emojis para las tragamonedas
    const items = ["🍓", "🍍", "🥑", "🍒", "🍇"];
    
    // Función para generar un resultado aleatorio
    const getRandomItem = () => items[Math.floor(Math.random() * items.length)];

    // Generar la combinación de 3 símbolos
    const reel1 = getRandomItem();
    const reel2 = getRandomItem();
    const reel3 = getRandomItem();

    // Mostrar la combinación
    await sendReply(`🎰 ${reel1} ${reel2} ${reel3} 🎰`);

    // Verificar el resultado
    let amount = 0;

    if (reel1 === reel2 && reel2 === reel3) {
      // Tres iguales: ganar entre +2 y +8 monedas
      amount = Math.floor(Math.random() * 7) + 2; // Ganar entre 2 y 8 monedas
      await sendReply(`🎉 ¡Has ganado ${amount} monedas! 🎉`);
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      // Dos iguales: ganar entre +1 y +5 monedas
      amount = Math.floor(Math.random() * 5) + 1; // Ganar entre 1 y 5 monedas
      await sendReply(`🎉 ¡Has ganado ${amount} monedas! 🎉`);
    } else {
      // Ningún igual: perder entre -1 y -8 monedas
      amount = -(Math.floor(Math.random() * 8) + 1); // Perder entre 1 y 8 monedas
      await sendReply(`😢 ¡Has perdido ${Math.abs(amount)} monedas! 😢`);
    }

    // Actualizar el saldo del usuario
    userKr.kr += amount;
    krData = krData.map(entry => (entry.userJid === userJid ? userKr : entry));
    writeData(krFilePath, krData);

    // Mostrar el saldo actualizado
    await sendReply(`💰 Tu saldo actual es: ${userKr.kr} 𝙺𝚛`);
  },
};