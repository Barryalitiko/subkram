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
  name: "divorce",
  description: "Divorciarte de tu pareja actual con un papel de divorcio.",
  commands: ["divorce"],
  usage: `${PREFIX}divorce`,
  handle: async ({ sendReply, socket, userJid, remoteJid }) => {
    const marriageData = readData(MARRIAGE_FILE_PATH);
    const userItems = readData(USER_ITEMS_FILE_PATH);

    // Verificar si el usuario está casado
    const marriageIndex = marriageData.findIndex(
      (entry) => entry.userJid === userJid || entry.partnerJid === userJid
    );

    if (marriageIndex === -1) {
      await sendReply("❌ No estás casado actualmente.\n> Krampus OM bot");
      return;
    }

    // Verificar si el usuario tiene un papel de divorcio
    const userItem = userItems.find((entry) => entry.userJid === userJid);
    if (!userItem || userItem.items.divorcePapers < 1) {
      await sendReply("❌ No tienes un lapiz para firmar 🫣\nCompra uno para poder divorciarte.\n> Usa #tienda para comprarlo");
      return;
    }

    // Reducir el número de papeles de divorcio en el inventario
    userItem.items.divorcePapers -= 1;
    writeData(USER_ITEMS_FILE_PATH, userItems);

    // Procesar divorcio
    const { userJid: partner1, partnerJid: partner2 } = marriageData[marriageIndex];
    marriageData.splice(marriageIndex, 1); // Eliminar matrimonio
    writeData(MARRIAGE_FILE_PATH, marriageData);

    // Enviar mensaje con menciones
    await socket.sendMessage(remoteJid, {
      text: `📄 *¡Divorcio confirmado!*  
@${partner1.split("@")[0]} y @${partner2.split("@")[0]} ahora están oficialmente divorciados. 💔`,
      mentions: [partner1, partner2]
    });
  },
};