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

// Definir los precios y Pokémon con versión shiny
const precios = {
  "pikachu": 100,
  "bulbasaur": 80,
  "charmander": 90,
  "squirtle": 85,
  "eevee": 110,
  "shiny": 200, // Precio para obtener un shiny aleatorio
};

const shinies = ["pikachu-shiny", "bulbasaur-shiny", "charmander-shiny", "squirtle-shiny", "eevee-shiny"];

module.exports = {
  name: "comprar",
  description: "Compra un Pokémon usando tus monedas.",
  commands: ["comprar"],
  usage: `${PREFIX}comprar <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon || !precios[pokemon]) {
      await sendReply(`❌ Debes especificar un Pokémon válido para comprar. Ejemplo: *${PREFIX}comprar pikachu* o *${PREFIX}comprar shiny* para un Pokémon shiny aleatorio.`);
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

    let pokemonComprado = pokemon;

    // Si el usuario compra un shiny, seleccionamos uno al azar
    if (pokemon === "shiny") {
      const randomShiny = shinies[Math.floor(Math.random() * shinies.length)];
      pokemonComprado = randomShiny;
    }

    // Añadir el Pokémon a la colección del usuario si no lo tiene ya
    if (!userPokemons[userJid].includes(pokemonComprado)) {
      userPokemons[userJid].push(pokemonComprado);
    }

    // Restar las monedas del usuario
    userKrEntry.kr -= precios[pokemon];
    writeData(krFilePath, krData);
    writeData(userPokemonsFilePath, userPokemons);

    await sendReply(`✅ ¡Has comprado a *${pokemonComprado}*! 🎉\nTe quedan ${userKrEntry.kr} monedas.`);
  },
};