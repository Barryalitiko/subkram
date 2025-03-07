const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

// Ruta para el archivo de datos de los Pokémon del usuario
const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

// Funciones para leer y escribir los datos de JSON
const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {}; // Retorna un objeto vacío si no se puede leer el archivo
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "invocar",
  description: "Invoca a un Pokémon que has comprado.",
  commands: ["invocar"],
  usage: `${PREFIX}invocar <nombre_del_pokemon>`,
  handle: async ({ sendReply, args, userJid, remoteJid }) => {
    const pokemons = {
      pikachu: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
      bulbasaur: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      charmander: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
      squirtle: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
      eevee: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
    };

    // Leer los Pokémon del usuario desde el archivo
    const userPokemons = readData(userPokemonsFilePath);
    const userPokemonList = userPokemons[userJid] || [];

    const pokemonName = args[0]?.toLowerCase();

    // Verificar si se proporciona un Pokémon válido
    if (!pokemonName || !pokemons[pokemonName]) {
      return sendReply("❌ No se ha encontrado ese Pokémon. Asegúrate de escribir su nombre correctamente.");
    }

    // Verificar si el usuario ha comprado el Pokémon
    if (!userPokemonList.includes(pokemonName)) {
      return sendReply("❌ No has comprado este Pokémon aún. ¡Compra uno primero usando el comando #tienda-pokemon!");
    }

    const pokemonImage = pokemons[pokemonName];

    // Enviar la respuesta al grupo usando remoteJid
    await sendReply({
      text: `¡Has invocado a ${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}! 🎉`,
      image: { url: pokemonImage },
      contextInfo: { mentionedJid: [userJid] }, // Esto menciona al usuario que invocó al Pokémon
      remoteJid: remoteJid, // Asegura que el mensaje se envíe al grupo
    });
  },
};