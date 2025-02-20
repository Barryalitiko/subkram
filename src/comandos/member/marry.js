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
  handle: async ({ sendReply, userJid, args, isReply, replyJid, client, remoteJid, mentionedJid }) => {
    let targetJid;

    if (isReply) {
      targetJid = replyJid;
    } else if (args && args.length > 0) {
      targetJid = args[0].replace("@", "") + "@s.whatsapp.net";
    }

    if (!targetJid) {
      await sendReply("❌ Debes etiquetar o responder a un usuario para proponer matrimonio.");
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
      (entry) => entry.userJid === targetJid || entry.partnerJid === targetJid
    );

    if (existingMarriage) {
      await sendReply("Cuernero, ya estás casado.");
      return;
    }

    await sendReply(`@${mentionedJid.split("@")[0]} ¿Aceptas la propuesta de matrimonio? Responde con "#r si" o "#r no". Tienes 3 minutos.`, {
      mentions: [mentionedJid],
    });
  },
};
