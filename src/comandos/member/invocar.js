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

const pokemonShinyImagenes = {
  "pikachu": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png",
  "bulbasaur": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
  "charmander": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/4.png",
  "squirtle": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/7.png",
  "eevee": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/133.png",
};

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {}; // Si hay un error, devolvemos un objeto vacío
  }
};

module.exports = {
  name: "invocar",
  description: "Invoca un Pokémon que has comprado.",
  commands: ["invocar"],
  usage: `${PREFIX}invocar <pokemon>`,
  handle: async ({ sendReply, args, userJid, remoteJid, socket }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply(`❌ Debes especificar un Pokémon para invocar. Ejemplo: *${PREFIX}invocar pikachu*`);
      return;
    }

    let userPokemons = readData(userPokemonsFilePath);

    // Verificar si el usuario ha comprado el Pokémon (normal o shiny)
    if (!userPokemons[userJid] || 
        (!userPokemons[userJid].includes(pokemon) && !userPokemons[userJid].includes(`${pokemon}_shiny`))) {
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección. ¿Seguro que lo compraste?`);
      return;
    }

    let imagenURL;
    let esShiny = false;

    if (userPokemons[userJid].includes(`${pokemon}_shiny`)) {
      imagenURL = pokemonShinyImagenes[pokemon]; // Obtener imagen shiny
      esShiny = true;
    } else if (userPokemons[userJid].includes(pokemon)) {
      imagenURL = pokemonImagenes[pokemon]; // Obtener imagen normal
    } else {
      await sendReply(`❌ Pokémon no reconocido.`);
      return;
    }

    // Verificar si la URL de la imagen está definida
    if (!imagenURL) {
      await sendReply(`❌ No se pudo encontrar la imagen del Pokémon *${pokemon}*.`);
      return;
    }

    // Enviar la imagen correspondiente del Pokémon
    try {
      await socket.sendMessage(remoteJid, {
        image: { url: imagenURL },
        caption: esShiny
          ? `✨ ¡Has invocado a un *${pokemon} shiny*! ✨`
          : `🎉 ¡Has invocado a *${pokemon}*!`,
      });
    } catch (error) {
      console.error("Error al enviar la imagen:", error);
      await sendReply("❌ Ocurrió un error al invocar tu Pokémon.");
    }
  },
};