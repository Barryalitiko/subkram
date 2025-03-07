const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");
const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");
const pokemonImagenes = {
  "pikachu": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  "bulbasaur": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  "charmander": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
  "squirtle": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
  "eevee": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
};
const errorMessages = {
  noPokemonSpecified: "❌ Debes especificar un Pokémon para invocar.",
  pokemonNotOwned: "❌ No tienes a *{}* en tu colección.",
  pokemonNotRecognized: "❌ Pokémon no reconocido.",
  errorInvokingPokemon: "❌ Ocurrió un error al invocar tu Pokémon.",
};
const logger = require("winston");

const readData = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    logger.error("Error al leer el archivo:", filePath);
    return {};
  }
};

const isValidPokemon = (pokemon) => {
  return Object.keys(pokemonImagenes).includes(pokemon);
};

module.exports = {
  name: "invocar",
  description: "Invoca un Pokémon que has comprado.",
  commands: ["invocar"],
  usage: `${PREFIX}invocar <pokemon>`,
  handle: async ({ sendReply, args, remoteJid, socket }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply(errorMessages.noPokemonSpecified);
      return;
    }
    if (!isValidPokemon(pokemon)) {
      await sendReply(errorMessages.pokemonNotRecognized);
      return;
    }
    let userPokemons = readData(userPokemonsFilePath);
    if (!userPokemons[remoteJid] || !userPokemons[remoteJid].includes(pokemon)) {
      await sendReply(errorMessages.pokemonNotOwned.replace("{}", pokemon));
      return;
    }
    const pokemonImagen = pokemonImagenes[pokemon];
    try {
      await socket.sendMessage(
        remoteJid,
        {
          image: { url: pokemonImagen },
          caption: `🎉 ¡Has invocado a *${pokemon}*!`,
        }
      );
    } catch (error) {
      logger.error("Error al enviar la imagen:", error);
      await sendReply(errorMessages.errorInvokingPokemon);
    }
  },
};
