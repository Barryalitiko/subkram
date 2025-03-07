const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};  // Si hay un error, devolvemos un objeto vacío o arreglo vacío según sea el caso
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "tienda-pokemon",
  description: "Compra un pokemon.",
  commands: ["tienda-pokemon"],
  usage: `${PREFIX}tienda-pokemon <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const precios = {
      "pikachu": 50,
      "bulbasaur": 45,
      "charmander": 60,
      // Aquí puedes agregar más pokemones con sus respectivos precios
    };

    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply(`❌ Debes especificar un Pokémon para comprar. Ejemplo: *${PREFIX}tienda-pokemon pikachu*`);
      return;
    }

    if (!precios[pokemon]) {
      await sendReply(`❌ Pokémon no disponible en la tienda.`);
      return;
    }

    let krData = readData(krFilePath);
    let userKrEntry = krData.find(entry => entry.userJid === userJid);

    if (!userKrEntry) {
      userKrEntry = { userJid, kr: 0 };
      krData.push(userKrEntry);
    }

    if (userKrEntry.kr < precios[pokemon]) {
      await sendReply(`❌ No tienes suficientes monedas para comprar ${pokemon}. Necesitas ${precios[pokemon]} monedas.`);
      return;
    }

    let userItems = readData(userItemsFilePath);
    let userItemEntry = userItems[userJid];  // Accedemos directamente a la clave con el userJid

    if (!userItemEntry) {
      userItemEntry = { pokemones: [] };  // Inicializamos el objeto si no existe
      userItems[userJid] = userItemEntry;
    }

    userItemEntry.pokemones.push(pokemon);  // Añadimos el nuevo Pokémon al arreglo

    userKrEntry.kr -= precios[pokemon];  // Restamos las monedas

    writeData(userItemsFilePath, userItems);  // Guardamos los objetos del usuario
    writeData(krFilePath, krData);  // Guardamos las monedas

    await sendReply(`✅ ¡Has comprado a ${pokemon}!\nAhora tienes ${userKrEntry.kr} monedas.`);
  },
};