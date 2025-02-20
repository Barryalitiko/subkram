const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const MARRIAGE_FILE_PATH = path.resolve(process.cwd(), "assets/marriage.json");
const USER_ITEMS_FILE_PATH = path.resolve(process.cwd(), "assets/userItems.json");

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
  name: "boda",
  description: "Proponer matrimonio a alguien.",
  commands: ["boda"],
  usage: `${PREFIX}boda 💍 @usuario`,
  handle: async ({ sendReply, userJid, mentionedJid, message, client }) => {
    if (!mentionedJid || !userJid) {
      await sendReply("Debes mencionar a alguien para proponer matrimonio.");
      return;
    }

    const userItems = readData(USER_ITEMS_FILE_PATH);
    const userItem = userItems.find((entry) => entry.userJid === userJid);

    if (!userItem || userItem.items.anillos <= 0) {
      await sendReply("¿Y el anillo pa' cuando?");
      return;
    }

    const marriageData = readData(MARRIAGE_FILE_PATH);
    const existingMarriage = marriageData.find(
      (entry) => entry.userJid === mentionedJid || entry.partnerJid === mentionedJid
    );

    if (existingMarriage) {
      await sendReply("Cuernero, ya estás casado.");
      return;
    }

    await sendReply(`@${mentionedJid} ¿Aceptas la propuesta de matrimonio? Responde con "#r si" o "#r no". Tienes 3 minutos.`);

    const timeout = setTimeout(() => {
      sendReply(`La propuesta de matrimonio a @${mentionedJid} ha sido rechazada por falta de respuesta.`);
      client.removeListener("message", onResponse);
    }, 180000);

    const onResponse = async (msg) => {
      const senderJid = msg.sender;
      const response = msg.body.trim().toLowerCase();

      if (!response.startsWith("#r")) return;

      if (senderJid !== mentionedJid) return;

      if (response === "#r si") {
        const marriageEntry = {
          userJid: userJid,
          partnerJid: mentionedJid,
          date: new Date().toISOString(),
          groupId: "groupId12345",
          dailyLove: 0,
        };

        marriageData.push(marriageEntry);
        writeData(MARRIAGE_FILE_PATH, marriageData);

        userItem.items.anillos -= 1;
        writeData(USER_ITEMS_FILE_PATH, userItems);

        await sendReply(`¡Felicidades! @${userJid} y @${mentionedJid} están ahora casados. 💍`);
      } else if (response === "#r no") {
        await sendReply(`@${mentionedJid} ha rechazado la propuesta de matrimonio. ❌`);
      } else {
        await sendReply(`@${mentionedJid}, debes responder con "#r si" o "#r no".`);
        return;
      }

      clearTimeout(timeout);
      client.removeListener("message", onResponse);
    };

    client.on("message", onResponse);
  },
};
