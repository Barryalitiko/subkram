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
  "ivysaur": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
  "venusaur": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
  "charmeleon": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png",
  "charizard": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
  "wartortle": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png",
  "blastoise": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
  "caterpie": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
  "metapod": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png",
  "butterfree": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
  "weedle": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png",
  "kakuna": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png",
  "beedrill": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
  "pidgey": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png",
  "pidgeotto": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png",
  "pidgeot": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
  "rattata": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
  "raticate": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png",
  "sandshrew": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png",
  "sandslash": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png",
  "nidoran-f": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png",
  "nidorina": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png",
  "nidoqueen": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png",
  "nidoran-m": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png",
  "nidorino": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/33.png",
  "nidoking": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png",
  "clefairy": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png",
  "clefable": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png",
  "vulpix": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png",
  "ninetales": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png",
  "jigglypuff": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
  "wigglytuff": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png",
  "zubat": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png",
  "golbat": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png",
  "oddish": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png",
  "gloom": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png",
  "vileplume": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png",
  "paras": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png",
  "parasec": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png",
  "venonat": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/48.png",
  "venomoth": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/49.png",
  "diglett": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png",
  "dugtrio": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png",
  "meowth": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png",
  "persian": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png",
  "psyduck": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png",
  "golduck": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/55.png",
  "machop": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/56.png",
  "machoke": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/57.png",
  "machamp": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png",
  "bellsprout": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/69.png",
  "weepinbell": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/70.png",
  "victreebel": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/71.png",
  "tentacool": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/72.png",
  "tentacruel": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/73.png",
  "geodude": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png",
  "graveler": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png",
  "golem": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png",
  "ponyta": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/77.png",
  "rapidash": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png",
  "slowpoke": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png",
  "slowbro": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/80.png",
  "magnemite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/81.png",
  "magneton": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/82.png",
  "farfetchd": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/83.png",
  "sirfetchd": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/84.png",
  "doduo": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/85.png",
  "dodrio": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/86.png",
  "seel": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/87.png",
  "dewgong": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/88.png",
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

    // Verificar si el usuario ha comprado el Pokémon
    if (!userPokemons[userJid] || !userPokemons[userJid].includes(pokemon)) {
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección. ¿Seguro que lo compraste?`);
      return;
    }

    let imagenURL = pokemonImagenes[pokemon]; // Obtener imagen normal

    // Verificar si la URL de la imagen está definida
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