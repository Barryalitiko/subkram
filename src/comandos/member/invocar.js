const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

const pokemonImagenes = {
  "pichu": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/172.png",
  "pikachu": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  "raichu": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png",
  "pichu_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/172.png",
  "pikachu_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png",
  "raichu_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/26.png"
};

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};  // Si hay un error, devolvemos un objeto vacío
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
      await sendReply(`❌ Debes especificar un Pokémon para invocar. Ejemplo: *${PREFIX}invocar pichu*`);
      return;
    }

    let userPokemons = readData(userPokemonsFilePath);

    // Verificar si el usuario ha comprado el Pokémon
    if (!userPokemons[userJid] || !userPokemons[userJid].includes(pokemon)) {
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección. ¿Seguro que lo compraste?`);
      return;
    }

    const imagenURL = pokemonImagenes[pokemon];  // Obtener la imagen del Pokémon

    if (!imagenURL) {
      await sendReply(`❌ No se pudo encontrar la imagen del Pokémon *${pokemon}*.`);
      return;
    }

    // Enviar la imagen correspondiente del Pokémon
    try {
      await socket.sendMessage(remoteJid, {
        image: { url: imagenURL },
        caption: `🎉 ¡Has invocado a *${pokemon}*!`,
      });
    } catch (error) {
      console.error("Error al enviar la imagen:", error);
      await sendReply("❌ Ocurrió un error al invocar tu Pokémon.");
    }
  },
};