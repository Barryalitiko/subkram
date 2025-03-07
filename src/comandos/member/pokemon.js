const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
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

module.exports = {
  name: "comprar",
  description: "Compra un Pokémon usando tus monedas.",
  commands: ["comprar"],
  usage: `${PREFIX}comprar <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const precios = {
      "pikachu": 100,
      "bulbasaur": 80,
      "charmander": 90,
      "squirtle": 85,
      "eevee": 110,
    };

    const pokemon = args[0]?.toLowerCase();
    if (!pokemon || !precios[pokemon]) {
      await sendReply(`❌ Debes especificar un Pokémon válido para comprar. Ejemplo: *${PREFIX}comprar pikachu*`);
      return;
    }

    let krData = readData(krFilePath);
    let userKrEntry = krData.find(entry => entry.userJid === userJid);

    if (!userKrEntry || userKrEntry.kr < precios[pokemon]) {
      await sendReply(`❌ No tienes suficientes monedas para comprar *${pokemon}*. Necesitas ${precios[pokemon]} monedas.`);
      return;
    }

    let userPokemons = readData(userPokemonsFilePath);

    if (!userPokemons[userJid]) {
      userPokemons[userJid] = [];
    }

    // Añadir el Pokémon a la colección del usuario
    if (!userPokemons[userJid].includes(pokemon)) {
      userPokemons[userJid].push(pokemon);
    }

    // Restar las monedas del usuario
    userKrEntry.kr -= precios[pokemon];
    writeData(krFilePath, krData);
    writeData(userPokemonsFilePath, userPokemons);

    await sendReply(`✅ ¡Has comprado a *${pokemon}*!\nTe quedan ${userKrEntry.kr} monedas.`);
  },
};