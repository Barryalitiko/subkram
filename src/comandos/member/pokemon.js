const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");
const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};  // Si hay un error, devolvemos un objeto vacío
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Definir los precios para los objetos y Pokémon (agregar más Pokémon aquí)
const precios = {
  "pichu": 50,  // Pichu añadido a la tienda
  "pikachu": 150, // Agrega más Pokémon aquí
  "raichu": 200,  // Ejemplo de otro Pokémon
};

module.exports = {
  name: "tienda",
  description: "Compra objetos en la tienda con tus monedas.",
  commands: ["comprar"],
  usage: `${PREFIX}tienda <objeto>`,
  handle: async ({ sendReply, args, userJid }) => {
    const objeto = args[0]?.toLowerCase();

    if (!objeto) {
      // Mostrar lista de objetos disponibles para comprar
      let listaPrecios = "🛒 *Lista de precios de la tienda*:\n";
      
      for (const [item, precio] of Object.entries(precios)) {
        listaPrecios += `- ${item}: ${precio} monedas\n`;
      }
      listaPrecios += `\nUsa *${PREFIX}tienda <objeto>* para comprar.\n> Por ejemplo *#tienda pichu*`;
      await sendReply(listaPrecios);
      return;
    }

    if (!precios[objeto]) {
      await sendReply("❌ Objeto inválido. Usa el comando sin emojis para ver la lista de objetos.");
      return;
    }

    let krData = readData(krFilePath);
    if (!krData.find(entry => entry.userJid === userJid)) {
      krData.push({ userJid, kr: 0 });
    }
    const userKr = krData.find(entry => entry.userJid === userJid).kr;

    if (userKr < precios[objeto]) {
      await sendReply(`❌ No tienes suficientes monedas para comprar ${objeto}. Necesitas ${precios[objeto]} monedas.`);
      return;
    }

    let userItems = readData(userItemsFilePath);
    if (typeof userItems !== 'object' || !Array.isArray(userItems)) {
      userItems = [];
    }
    if (!userItems.find(entry => entry.userJid === userJid)) {
      userItems.push({ userJid, items: { hongos: 0 } });
    }
    const userItem = userItems.find(entry => entry.userJid === userJid);

    // Agregar el Pokémon a la colección del usuario si no lo tiene
    if (precios[objeto]) {
      let userPokemons = readData(userPokemonsFilePath);
      if (!userPokemons[userJid]) {
        userPokemons[userJid] = [];
      }
      if (userPokemons[userJid].includes(objeto)) {
        await sendReply(`❌ Ya tienes un *${objeto}* en tu colección.`);
        return;
      }
      userPokemons[userJid].push(objeto);  // Agregar el Pokémon a la colección
      writeData(userPokemonsFilePath, userPokemons);
    }

    const userKrBalance = userKr - precios[objeto];
    krData = krData.map(entry => entry.userJid === userJid ? { userJid, kr: userKrBalance } : entry);
    userItems = userItems.map(entry => entry.userJid === userJid ? userItem : entry);

    writeData(userItemsFilePath, userItems);
    writeData(krFilePath, krData);

    await sendReply(`✅ ¡Has comprado ${objeto}!\nAhora tienes ${userKrBalance} monedas.`);
  },
};