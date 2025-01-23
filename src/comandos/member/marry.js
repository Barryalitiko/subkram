const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const marriageFilePath = path.resolve(process.cwd(), "assets/marriage.json");
const inventoryFilePath = path.resolve(process.cwd(), "assets/inventory.json");

// Funciones para leer y escribir los datos JSON
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
  name: "marry",
  description: "Proponer matrimonio a otro usuario.",
  commands: ["marry"],
  usage: `${PREFIX}marry @usuario`,
  handle: async ({ sendReply, userJid, args }) => {
    const targetJid = args[0]?.replace("@", "") + "@s.whatsapp.net";
    
    if (!targetJid) {
      await sendReply("❌ Debes etiquetar a alguien para hacerle la propuesta de matrimonio.");
      return;
    }

    const inventoryData = readData(inventoryFilePath);
    const userInventory = inventoryData.find((entry) => entry.userJid === userJid);

    // Verificar si el usuario tiene un anillo de compromiso
    if (!userInventory || userInventory.ring < 1) {
      await sendReply("❌ Necesitas un anillo de compromiso para hacer una propuesta.");
      return;
    }

    // Solicitar respuesta del usuario destino
    await sendReply(
      `💍 @${targetJid.split("@")[0]}, ¿aceptas casarte con @${userJid.split("@")[0]}? Responde con #si o #no.`
    );

    // Escuchar la respuesta del usuario destino
    const listenForResponse = async (response) => {
      const { text, from } = response;
      if (from !== targetJid || !["#si", "#no"].includes(text.toLowerCase())) return;

      // Si el destino responde con #si, se realiza el matrimonio
      if (text.toLowerCase() === "#si") {
        const marriageData = readData(marriageFilePath);
        marriageData.push({
          userJid,
          partnerJid: targetJid,
          date: new Date().toISOString(),
          groupId: response.remoteJid, // Suponiendo que el grupo está en remoteJid
          dailyLove: 0, // Inicia el contador de amor diario
        });
        writeData(marriageFilePath, marriageData);

        // Reducir el anillo de compromiso
        userInventory.ring -= 1;
        writeData(inventoryFilePath, inventoryData);

        await sendReply(`💍 ¡Felicidades! @${userJid.split("@")[0]} y @${targetJid.split("@")[0]} están ahora casados.`);
      } else {
        await sendReply("❌ La propuesta de matrimonio fue rechazada.");
      }
    };

    // Función que escucha el mensaje de respuesta
    socket.on("message", listenForResponse);
  },
};