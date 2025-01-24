const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const commandStatusFilePath = path.resolve(process.cwd(), "assets/monedas.json");
const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "tienda",
  description: "Compra objetos en la tienda con tus monedas.",
  commands: ["tienda"],
  usage: `${PREFIX}tienda <objeto>`,
  handle: async ({ sendReply, args, userJid }) => {
    // Verificar si el sistema de monedas está activado
    const commandStatus = readData(commandStatusFilePath);
    if (commandStatus.commandStatus !== "on") {
      await sendReply("❌ El sistema de tienda está desactivado.");
      return;
    }

    // Lista de precios
    const precios = {
      "💍": 6,
      "📜": 7,
    };

    // Si no se especifica un objeto, mostrar la lista de precios
    const objeto = args[0]?.toLowerCase();
    if (!objeto) {
      let listaPrecios = "🛒 *Lista de precios de la tienda*:\n";
      for (const [item, precio] of Object.entries(precios)) {
        listaPrecios += `- ${item}: ${precio} monedas\n`;
      }
      listaPrecios += `\nUsa *${PREFIX}tienda <objeto>* para comprar.`;
      await sendReply(listaPrecios);
      return;
    }

    // Validar que el objeto sea válido
    if (!precios[objeto]) {
      await sendReply("❌ Objeto inválido. Usa el comando sin argumentos para ver la lista de precios.");
      return;
    }

    // Leer datos de monedas y objetos del usuario
    const krData = readData(krFilePath);
    const userKr = krData.users[userJid]?.kr || 0; // Monedas actuales del usuario

    if (userKr < precios[objeto]) {
      await sendReply(`❌ No tienes suficientes monedas. Necesitas ${precios[objeto]} monedas para comprar ${objeto}.`);
      return;
    }

    // Leer datos de objetos
    const userItems = readData(userItemsFilePath);
    if (!userItems.users[userJid]) {
      userItems.users[userJid] = { anillos: 0, papeles: 0 };
    }

    // Actualizar el inventario del usuario
    if (objeto === "💍") {
      userItems.users[userJid].anillos += 1;
    } else if (objeto === "📜") {
      userItems.users[userJid].papeles += 1;
    }

    // Descontar monedas al usuario
    krData.users[userJid].kr -= precios[objeto];

    // Escribir cambios en los archivos
    writeData(userItemsFilePath, userItems);
    writeData(krFilePath, krData);

    await sendReply(`✅ ¡Has comprado ${objeto}! Ahora tienes ${krData.users[userJid].kr} monedas y:\n- 💍: ${userItems.users[userJid].anillos}\n- 📜: ${userItems.users[userJid].papeles}`);
  },
};