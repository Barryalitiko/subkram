const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "dar-monedas",
  description: "Añade 1000 monedas al usuario.",
  commands: ["dar-monedas"],
  usage: `${PREFIX}dar-monedas`,
  handle: async ({ sendReply, userJid }) => {
    let krData = readData(krFilePath);
    let userKrEntry = krData.find(entry => entry.userJid === userJid);

    if (!userKrEntry) {
      userKrEntry = { userJid, kr: 0 };
      krData.push(userKrEntry);
    }

    userKrEntry.kr += 1000;

    writeData(krFilePath, krData);

    await sendReply(`✅ ¡Se te han añadido 1000 monedas! Ahora tienes un total de ${userKrEntry.kr} monedas.`);
  },
};