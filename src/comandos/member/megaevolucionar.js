const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");
const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

const megaEvoluciones = {
  "bulbasaur": "mega_venusaur",
  "charmander": ["mega_charizard_x", "mega_charizard_y"],
  "squirtle": "mega_blastoise",
  "abra": "mega_alakazam",
  "gastly": "mega_gengar",
  "slowpoke": "mega_slowbro",
  "magikarp": "mega_gyarados",
  "mareep": "mega_ampharos",
  "larvitar": "mega_tyranitar"
};

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
  name: "megaevolucionar",
  description: "Mega Evoluciona tu Pokémon si tienes el objeto ⚡️.",
  commands: ["megaevolucionar"],
  usage: `${PREFIX}megaevolucionar <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply(`❌ Debes especificar un Pokémon para megaevolucionar. Ejemplo: *${PREFIX}megaevolucionar charmander*`);
      return;
    }

    let userPokemons = readData(userPokemonsFilePath);
    let userItems = readData(userItemsFilePath);

    // Verificar si el usuario tiene el Pokémon
    if (!userPokemons[userJid] || !userPokemons[userJid].includes(pokemon)) {
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección.`);
      return;
    }

    // Verificar si el usuario tiene el objeto ⚡️
    let userItem = userItems.find(entry => entry.userJid === userJid);
    if (!userItem) {
      userItem = { userJid, items: { rayos: 0 } };
      userItems.push(userItem);
    }

    if (userItem.items.rayos <= 0) {
      await sendReply(`❌ No tienes el objeto ⚡️ necesario para la megaevolución.`);
      return;
    }

    // Verificar si el Pokémon puede megaevolucionar
    if (!megaEvoluciones[pokemon]) {
      await sendReply(`❌ *${pokemon}* no puede megaevolucionar.`);
      return;
    }

    // Elegir evolución (si hay más de una opción, elegir aleatoriamente)
    let megaEvolucion = megaEvoluciones[pokemon];
    if (Array.isArray(megaEvolucion)) {
      megaEvolucion = megaEvolucion[Math.floor(Math.random() * megaEvolucion.length)];
    }

    console.log(`Megaevolucionando ${pokemon} a ${megaEvolucion}`); // Verificación adicional

    // Realizar la megaevolución
    userPokemons[userJid] = userPokemons[userJid].filter(p => p !== pokemon);
    userPokemons[userJid].push(megaEvolucion);

    // Consumir el objeto ⚡️
    userItem.items.rayos -= 1;

    // Guardar los cambios
    writeData(userPokemonsFilePath, userPokemons);
    writeData(userItemsFilePath, userItems);

    await sendReply(`⚡ ¡Increíble! *${pokemon}* ha megaevolucionado a *${megaEvolucion}*! 💥🔥`);
  }
};