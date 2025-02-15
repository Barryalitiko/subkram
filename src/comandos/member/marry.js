const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const marriageFilePath = path.resolve(process.cwd(), "assets/marriage.json");
const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");

const readData = (filePath) => {
try {
return JSON.parse(fs.readFileSync(filePath, "utf-8"));
} catch (error) {
console.error(`Error al leer el archivo ${filePath}: ${error.message}`);
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

const yesResponses = [
"¡Felicidades! Estás ahora casado. 💕",
"¡Genial! La unión hace la fuerza. 💪",
"¡Excelente elección! Estás ahora casado. 😊",
"¡Enhorabuena! La vida en pareja es hermosa. 🌹",
"¡Muy bien! Estás ahora casado. 👏",
"¡Qué alegría! La unión es la fuerza. 🎉",
"¡Estupendo! Estás ahora casado. 😃",
"¡Buenísimo! La vida en pareja es divertida. 😄",
"¡Genial! Estás ahora casado. 🤩",
"¡Felicidades! La unión es la clave del éxito. 🏆",
];

const noResponses = [
"¡Lo siento! La propuesta ha sido rechazada. 😔",
"¡Oh no! La respuesta es no. 😢",
"¡Qué pena! La propuesta no ha sido aceptada. 😞",
"¡Lo siento! La respuesta es negativa. 😟",
"¡Oh no! La propuesta ha sido rechazada. 😠",
"¡Qué lástima! La respuesta es no. 😡",
"¡Lo siento! La propuesta no ha sido aceptada. 😢",
"¡Oh no! La respuesta es negativa. 😭",
"¡Qué pena! La propuesta ha sido rechazada. 😓",
"¡Lo siento! La respuesta es no. 😔",
];

const alreadyMarriedResponses = [
"¡Lo siento! Ya estás casado. 😳",
"¡Oh no! Ya tienes una pareja. 😲",
"¡Qué pena! Ya estás comprometido. 😞",
"¡Lo siento! Ya tienes una relación. 😟",
"¡Oh no! Ya estás casado. 😠",
"¡Qué lástima! Ya tienes una pareja. 😡",
"¡Lo siento! Ya estás comprometido. 😢",
"¡Oh no! Ya tienes una relación. 😭",
"¡Qué pena! Ya estás casado. 😓",
"¡Lo siento! Ya tienes una pareja. 😔",
];

module.exports = {
name: "boda",
description: "Proponer matrimonio a alguien.",
commands: ["boda"],
usage: `${PREFIX}boda @usuario`,
handle: async ({ sendReply, userJid, mentionedJid }) => {
const userItems = readData(userItemsFilePath);
const userItem = userItems.find((entry) => entry.userJid === userJid);

// Verificar si el usuario tiene un anillo
if (!userItem || userItem.items.anillos <= 0) {
  await sendReply("¿Y el anillo pa' cuando?");
  return;
}

// Verificar si el usuario propuesto ya está casado
const marriageData = readData(marriageFilePath);
const existingMarriage = marriageData.find(
  (entry) => entry.userJid === mentionedJid || entry.partnerJid === mentionedJid
);
if (existingMarriage) {
  const response =
    alreadyMarriedResponses[Math.floor(Math.random() * alreadyMarriedResponses.length)];
  await sendReply(response);
  return;
}

// Verificar si el usuario que propone el matrimonio ya está casado
const existingMarriage2 = marriageData.find(
  (entry) => entry.userJid === userJid || entry.partnerJid === userJid
);
if (existingMarriage2) {
  const response =
    alreadyMarriedResponses[Math.floor(Math.random() * alreadyMarriedResponses.length)];
  await sendReply(response);
  return;
}

// Propuesta de matrimonio
await sendReply(`@${mentionedJid} ¿Aceptas la propuesta de matrimonio? Responde con #si o #no.`);

// Esperar la respuesta
const onResponse = async (message) => {
  if (message.includes("#si")) {
    const response = yesResponses[Math.floor(Math.random() * yesResponses.length)];
    await sendReply(response);

    // Crear un nuevo matrimonio
    const marriageEntry = {
      userJid: userJid,
      partnerJid: mentionedJid,
      date: new Date().toISOString(),
      groupId: "groupId12345",
      dailyLove: 0,
    };
    marriageData.push(marriageEntry);
    writeData(marriageFilePath, marriageData);

    // Descontar el anillo del inventario del usuario
    userItem.items.anillos -= 1;
    writeData(userItemsFilePath, userItems);
  } else if (message.includes("#no")) {
    const response = noResponses[Math.floor(Math.random() * noResponses.length)];
    await sendReply(response);
  }
};

// Reaccionar con emojis
await sendReply("💕👰🤵");

// Esperar la respuesta
setTimeout(onResponse, 3000);
},
};