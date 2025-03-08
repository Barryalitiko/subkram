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
  "pidgey": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png",
  "rattata": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
  "machop": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png",
  "bellsprout": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/69.png",
  "zubat": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png",
  "geodude": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png",
  "oddish": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png",
  "diglett": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png",
  "gastly": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png",
  "mankey": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/56.png",
  "psyduck": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png",
  "sandslash": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png",
  "vileplume": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png",
  "clefairy": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png",
  "clefable": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png",
  "jigglypuff": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
  "wigglytuff": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png",
  "paras": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png",
  "parasect": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png",
  "caterpie": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
  "metapod": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png",
  "butterfree": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
  "weedle": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png",
  "kakuna": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png",
  "beedrill": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
  "machoke": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png",
  "machamp": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png",
  "electrode": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png",
  "voltorb": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/100.png",
  "ivysaur": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
  "venusaur": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
  "charmeleon": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png",
  "charizard": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
  "wartortle": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png",
  "blastoise": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
  "raichu": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png",
  "pidgeot": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png",
  "rhydon": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png",
  "nidoking": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png",
  "nidoqueen": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png",
  "exeggutor": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png",
  "nidoran♀": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png",
  "nidorina": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png",
  "nidoran♂": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png",
  "meowth": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png",
  "persian": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png",
  "horsea": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/116.png",
  "seadra": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/117.png",
  "shellder": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/90.png",
  "cloyster": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png",
  "porygon": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/137.png",
  "snorlax": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
  "lapras": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png",
  "articuno": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
  "zapdos": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png",
  "moltres": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png",
  "dratini": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png",
  "dragonair": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png",
  "dragonite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
  "tangela": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/114.png",
  "kangaskhan": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/115.png",
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
      await sendReply(`❌ Debes especificar un Pokémon para invocar. Ejemplo: *${PREFIX}invocar pikachu*`);
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