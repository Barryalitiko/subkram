const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

module.exports = {
  name: "pokédex",
  description: "Muestra los Pokémon comprados por el usuario.",
  commands: ["pokedex"],
  usage: `${PREFIX}pokédex`,
  handle: async ({ sendReply, userJid }) => {
    let userPokemons = readData(userPokemonsFilePath);

    // Verificar si el usuario tiene Pokémon
    if (!userPokemons[userJid] || userPokemons[userJid].length === 0) {
      await sendReply("❌ No tienes Pokémon en tu colección.");
      return;
    }

    // Obtener los Pokémon del usuario
    const pokemons = userPokemons[userJid];

    // Crear un mensaje con los Pokémon comprados
    let pokedexMessage = "¡Estos son los Pokémon que tienes en tu Pokédex!\n\n";
    pokemons.forEach((pokemon) => {
      pokedexMessage += `*${pokemon}*\n`;
    });

    await sendReply(pokedexMessage);
  },
};

// Función para leer los datos del archivo
const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {}; // Si hay un error, devolvemos un objeto vacío
  }
};