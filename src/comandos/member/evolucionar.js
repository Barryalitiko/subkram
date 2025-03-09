const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");
const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

const pokemonEvoluciones = {
  "pichu": "pikachu",
  "pikachu": "raichu",
  "pichu_shiny": "pikachu_shiny",
  "pikachu_shiny": "raichu_shiny"
};

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
  name: "evolucionar",
  description: "Evoluciona tu Pokémon si tienes el hongo 🍄 en tu inventario.",
  commands: ["evolucionar"],
  usage: `${PREFIX}evolucionar <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply(`❌ Debes especificar un Pokémon para evolucionar. Ejemplo: *${PREFIX}evolucionar pichu*`);
      return;
    }

    let userPokemons = readData(userPokemonsFilePath);
    let userItems = readData(userItemsFilePath);

    // Verificar si el usuario tiene el Pokémon
    if (!userPokemons[userJid] || !userPokemons[userJid].includes(pokemon)) {
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección. ¿Seguro que lo compraste?`);
      return;
    }

    // Verificar si el usuario tiene el objeto 🍄
    let userItem = userItems.find(entry => entry.userJid === userJid);
    if (!userItem || userItem.items.hongos <= 0) {
      await sendReply(`❌ No tienes el objeto 🍄 necesario para la evolución.`);
      return;
    }

    // Verificar si el Pokémon tiene una evolución
    if (!pokemonEvoluciones[pokemon]) {
      await sendReply(`❌ *${pokemon}* no tiene evolución disponible o ya ha evolucionado completamente.`);
      return;
    }

    // Realizar la evolución: reemplazar el Pokémon antiguo con el nuevo
    const evolucion = pokemonEvoluciones[pokemon];
    userPokemons[userJid] = userPokemons[userJid].filter(p => p !== pokemon);
    userPokemons[userJid].push(evolucion);

    // Consumir el objeto 🍄
    userItem.items.hongos -= 1;

    // Guardar los cambios
    writeData(userPokemonsFilePath, userPokemons);
    writeData(userItemsFilePath, userItems);

    await sendReply(`✅ ¡Felicidades! *${pokemon}* ha evolucionado a *${evolucion}* y has usado un 🍄 de tu inventario.\nAhora tienes el nuevo Pokémon en tu colección.`);
  },
};