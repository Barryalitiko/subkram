const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const marriageFilePath = path.resolve(process.cwd(), "assets/marriage.json");
const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");

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
    const userItems = readData(userItemsFilePath);
    const userItem = userItems.find(entry => entry.userJid === userJid);

    // Verificar si el usuario tiene un anillo
    if (!userItem || userItem.items.anillos <= 0) {
      await sendReply("¿Y el anillo pa' cuando?");
      return;
    }

    // Verificar si el usuario propuesto ya está casado
    const marriageData = readData(marriageFilePath);
    const existingMarriage = marriageData.find(entry => entry.userJid === mentionedJid || entry.partnerJid === mentionedJid);
    
    if (existingMarriage) {
      await sendReply("Cuernero, ya estás casado.");
      return;
    }

    // Propuesta de matrimonio
    await sendReply(`@${mentionedJid} ¿Aceptas la propuesta de matrimonio? Responde con "#r si" o "#r no". Tienes 3 minutos.`);

    // Crear un timeout de 3 minutos para la respuesta
    const timeout = setTimeout(() => {
      sendReply(`La propuesta de matrimonio a @${mentionedJid} ha sido rechazada por falta de respuesta.`);
      client.removeListener("message", onResponse);
    }, 180000); // 3 minutos en milisegundos

    // Manejo de la respuesta con "#r si" o "#r no"
    const onResponse = async (msg) => {
      const senderJid = msg.sender;
      const response = msg.body.trim().toLowerCase();

      // Ignorar si el mensaje no empieza con "#r"
      if (!response.startsWith("#r")) return;

      // Si quien responde no es la persona mencionada, ignoramos
      if (senderJid !== mentionedJid) return;

      // Verificar respuesta válida
      if (response === "#r si") {
        // Confirmación de matrimonio
        const marriageEntry = {
          userJid: userJid,
          partnerJid: mentionedJid,
          date: new Date().toISOString(),
          groupId: "groupId12345", // Esto debería ser obtenido de algún lugar
          dailyLove: 0
        };

        marriageData.push(marriageEntry);
        writeData(marriageFilePath, marriageData);

        // Descontar el anillo del inventario del usuario
        userItem.items.anillos -= 1;
        writeData(userItemsFilePath, userItems);

        await sendReply(`¡Felicidades! @${userJid} y @${mentionedJid} están ahora casados. 💍`);
      } else if (response === "#r no") {
        // Rechazo de la propuesta
        await sendReply(`@${mentionedJid} ha rechazado la propuesta de matrimonio. ❌`);
      } else {
        // Si responde "#r" sin más o algo inválido
        await sendReply(`@${mentionedJid}, debes responder con "#r si" o "#r no".`);
        return; // No limpiar el timeout ni remover el listener aún
      }

      clearTimeout(timeout);
      client.removeListener("message", onResponse);
    };

    // Escuchar la respuesta
    client.on("message", onResponse);
  }
};