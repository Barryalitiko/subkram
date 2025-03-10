const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");
const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

const pokemonEvoluciones = {
  "pichu": "pikachu",
  "pikachu": "raichu",
  "pichu_shiny": "pikachu_shiny",
  "pikachu_shiny": "raichu_shiny",
  "bulbasaur": "ivysaur",
  "ivysaur": "venusaur",
  "bulbasaur_shiny": "ivysaur_shiny",
  "ivysaur_shiny": "venusaur_shiny",
  "charmander": "charmeleon",
  "charmeleon": "charizard",
  "charmander_shiny": "charmeleon_shiny",
  "charmeleon_shiny": "charizard_shiny",
  "squirtle": "wartortle",
  "wartortle": "blastoise",
  "squirtle_shiny": "wartortle_shiny",
  "wartortle_shiny": "blastoise_shiny",
  "caterpie": "metapod",
  "metapod": "butterfree",
  "weedle": "kakuna",
  "kakuna": "beedrill",
  "pidgey": "pidgeotto",
  "pidgeotto": "pidgeot",
  "rattata": "raticate",
  "spearow": "fearow",
  "ekans": "arbok",
  "sandshrew": "sandslash",
  "nidoran♀": "nidorina",
  "nidorina": "nidoqueen",
  "nidoran♂": "nidorino",
  "nidorino": "nidoking",
  "vulpix": "ninetales",
  "vulpix_alola": "ninetales_alola",
  "zubat": "golbat",
  "oddish": "gloom",
  "gloom": "vileplume",
  "paras": "parasec",
  "venonat": "venomoth",
  "diglett": "dugtrio",
  "meowth": "persian",
  "psyduck": "golduck",
  "mankey": "primeape",
  "growlithe": "arcanine",
  "poliwag": "poliwirl",
  "poliwirl": "politoed",
  "abra": "kadabra",
  "kadabra": "alakazam",
  "machop": "machoke",
  "machoke": "machamp",
  "bellsprout": "weepinbell",
  "weepinbell": "victreebel",
  "tentacool": "tentacruel",
  "geodude": "graveler",
  "graveler": "golem",
  "ponyta": "rapidash",
  "rapidash_galar": "rapidash_galar",
  "slowpoke": "slowbro",
  "slowbro_galar": "slowbro_galar",
  "magnemite": "magneton",
  "doduo": "dodrio",
  "seel": "dewgong",
  "grimer": "muk",
  "shellder": "cloyster",
  "gastly": "haunter",
  "haunter": "gengar",
  "drowzee": "hypno",
  "krabby": "kingler",
  "voltorb": "electrode",
  "exeggcute": "exeggutor",
  "exeggutor_alola": "exeggutor_alola",
  "cubone": "marowak",
  "marowak_alola": "marowak_alola",
  "tyrogue": "hitmontop",
  "koffing": "weezing",
  "weezing_galar": "weezing_galar",
  "rhyhorn": "rhydon",
  "rhydon": "rhyperior",
  "horsea": "seadra",
  "kingdra": "kingdra",
  "goldeen": "seaking",
  "staryu": "starmie",
  "magikarp": "gyarados",
  "eevee": "vaporeon", // Puedes expandir esto con todas las evoluciones de Eevee
  "omanyte": "omastar",
  "kabuto": "kabutops",
  "dratini": "dragonair",
  "dragonair": "dragonite",
  "chikorita": "bayleef",
  "bayleef": "meganium",
  "cyndaquil": "quilava",
  "quilava": "typhlosion",
  "typhlosion_hisuian": "typhlosion_hisuian",
  "totodile": "croconaw",
  "croconaw": "feraligatr",
  "sentret": "furret",
  "hoothoot": "noctowl",
  "ledyba": "ledian",
  "spinarak": "ariados",
  "chingling": "chimecho",
  "mareep": "flaaffy",
  "flaaffy": "ampharos",
  "hoppip": "skiploom",
  "skiploom": "jumpluff",
  "sunkern": "sunflora",
  "wooper": "quagsire",
  "wooper_hisuian": "quagsire_hisuian",
  "pineco": "forretress",
  "teddiursa": "ursaring",
  "ursaring_hisuian": "ursaring_hisuian",
  "slugma": "magcargo",
  "swinub": "piloswine",
  "remoraid": "octillery",
  "larvitar": "pupitar",
  "pupitar": "tyranitar"
};

const eeveeEvoluciones = [
  "vaporeon", "jolteon", "flareon", 
  "espeon", "umbreon", "leafeon", 
  "glaceon", "sylveon"
];

const eeveeShinyEvoluciones = [
  "vaporeon_shiny", "jolteon_shiny", "flareon_shiny",
  "espeon_shiny", "umbreon_shiny", "leafeon_shiny",
  "glaceon_shiny", "sylveon_shiny"
];

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
      await sendReply(`❌ Debes especificar un Pokémon para evolucionar.\n> Ejemplo: *${PREFIX}evolucionar pichu*`);
      return;
    }

    let userPokemons = readData(userPokemonsFilePath);
    let userItems = readData(userItemsFilePath);

    // Verificar si el usuario tiene el Pokémon
    if (!userPokemons[userJid] || !userPokemons[userJid].includes(pokemon)) {
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección.\n\n> ¿Seguro que lo compraste?`);
      return;
    }

    // Verificar si el usuario tiene el objeto 🍄
    let userItem = userItems.find(entry => entry.userJid === userJid);
    if (!userItem) {
      // Si el usuario no tiene una entrada en userItems, creamos una nueva
      userItem = { userJid, items: { hongos: 0 } };
      userItems.push(userItem); // Añadimos al arreglo
    }

    if (userItem.items.hongos <= 0) {
      await sendReply(`❌ No tienes 🍄 necesario para la evolución.\n\n> Usa #tienda 🍄 para comprarlo`);
      return;
    }

    // Verificar si el Pokémon es Eevee o Eevee shiny
    if (pokemon === "eevee" || pokemon === "eevee_shiny") {
      const isShiny = pokemon.includes("shiny");
      const evolucionesPosibles = isShiny ? eeveeShinyEvoluciones : eeveeEvoluciones;
      const evolucionElegida = evolucionesPosibles[Math.floor(Math.random() * evolucionesPosibles.length)];

      // Realizar la evolución: reemplazar el Pokémon antiguo con el nuevo
      userPokemons[userJid] = userPokemons[userJid].filter(p => p !== pokemon);
      userPokemons[userJid].push(evolucionElegida);

      // Consumir el objeto 🍄
      userItem.items.hongos -= 1;

      // Guardar los cambios
      writeData(userPokemonsFilePath, userPokemons);
      writeData(userItemsFilePath, userItems);

await sendReply(`¡Felicidades! tu *${pokemon}* ha evolucionado a *${evolucionElegida}*!\n\> Krampus OM bot`);

    } else if (pokemonEvoluciones[pokemon]) {
      const evolucion = pokemonEvoluciones[pokemon];

      // Realizar la evolución: reemplazar el Pokémon antiguo con el nuevo
      userPokemons[userJid] = userPokemons[userJid].filter(p => p !== pokemon);
      userPokemons[userJid].push(evolucion);

      // Consumir el objeto 🍄
      userItem.items.hongos -= 1;

      // Guardar los cambios
      writeData(userPokemonsFilePath, userPokemons);
      writeData(userItemsFilePath, userItems);

      await sendReply(`¡Felicidades! Tu *${pokemon}* ha evolucionado a *${evolucion}*!\n\n> Krampus OM bot`);
    } else {
      await sendReply(`❌ *${pokemon}* no puede evolucionar.`);
    }
  }
};