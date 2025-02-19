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
  name: "trabajo",
  description: "Elige un trabajo y gana monedas en 10 segundos.",
  commands: ["trabajo"],
  usage: `${PREFIX}trabajo`,
  handle: async ({ sendReply, userJid, args }) => {
    const trabajoStatus = readData(commandStatusFilePath);
    if (trabajoStatus.commandStatus !== "on") {
      await sendReply("❌ El sistema de trabajos está desactivado.");
      return;
    }

    const trabajoStats = readData(usageStatsFilePath);
    const userStats = trabajoStats.users?.[userJid] || { trabajo: null };

    if (userStats.trabajo) {
      await sendReply("❌ Ya estás trabajando en una profesión, termina tu trabajo actual.");
      return;
    }

    const trabajos = [
      { nombre: "Abogado", pago: [8, 10, 15] },
      { nombre: "Programador", pago: [8, 10, 15] },
      { nombre: "Ingeniero", pago: [8, 10, 15] },
      { nombre: "Carpintero", pago: [8, 10, 15] },
      { nombre: "Chef", pago: [8, 10, 15] },
      { nombre: "Doctor", pago: [8, 10, 15] },
      { nombre: "Abogado", pago: [8, 10, 15] },
      { nombre: "Profesor", pago: [8, 10, 15] },
      { nombre: "Pintor", pago: [8, 10, 15] },
      { nombre: "Policía", pago: [8, 10, 15] }
    ];

    const trabajoElegido = trabajos.find(t => t.nombre.toLowerCase() === args.join(" ").toLowerCase());
    if (!trabajoElegido) {
      await sendReply("❌ Profesión no válida. Usa el comando #trabajo para ver las profesiones disponibles.");
      return;
    }

    userStats.trabajo = trabajoElegido.nombre;
    trabajoStats.users = trabajoStats.users || {};
    trabajoStats.users[userJid] = userStats;
    writeData(usageStatsFilePath, trabajoStats);

    await sendReply(`💼 Has comenzado tu trabajo como **${trabajoElegido.nombre}**. ¡Te pagarán en breve!`);

    setTimeout(async () => {
      const pago = trabajoElegido.pago[Math.floor(Math.random() * trabajoElegido.pago.length)];

      let krData = readData(krFilePath);
      let userKr = krData.find(entry => entry.userJid === userJid);

      // Si el usuario no existe en kr.json, lo agregamos con 0 monedas
      if (!userKr) {
        userKr = { userJid, kr: 0 };
        krData.push(userKr);
        writeData(krFilePath, krData);
      }

      userKr.kr += pago;
      krData = krData.map(entry => (entry.userJid === userJid ? userKr : entry));
      writeData(krFilePath, krData);

      await sendReply(`🛠️ Tu trabajo como **${trabajoElegido.nombre}** ha terminado. Tu pago es de **${pago} monedas**.`);
      await sendReply(`💰 Tu saldo actual es: ${userKr.kr} 𝙺𝚛`);

      // Limpiar trabajo del usuario después de completar
      userStats.trabajo = null;
      trabajoStats.users[userJid] = userStats;
      writeData(usageStatsFilePath, trabajoStats);
    }, 10000); // 10 segundos (10000 ms)
  },
};