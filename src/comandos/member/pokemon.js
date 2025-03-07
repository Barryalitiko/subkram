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

// Definir los precios para los Pokémon
const precios = {
  "pikachu": 100,
  "bulbasaur": 80,
  "charmander": 90,
  "squirtle": 85,
  "eevee": 110,
  "pidgey": 60,
  "rattata": 55,
  "machop": 95,
  "bellsprout": 70,
  "zubat": 50,
  "geodude": 110,
  "oddish": 75,
  "diglett": 65,
  "gastly": 120,
  "mankey": 90,
  "psyduck": 80,
  "sandslash": 100,
  "vileplume": 130,
  "clefairy": 90,
  "clefable": 140,
  "jigglypuff": 95,
  "wigglytuff": 150,
  "paras": 70,
  "parasect": 135,
  "caterpie": 50,
  "metapod": 70,
  "butterfree": 150,
  "weedle": 55,
  "kakuna": 75,
  "beedrill": 150,
  "machoke": 110,
  "machamp": 200,
  "electrode": 180,
  "voltorb": 100,
  "ivysaur": 150,
  "venusaur": 250,
  "charmeleon": 160,
  "charizard": 280,
  "wartortle": 150,
  "blastoise": 300,
  "raichu": 180,
  "pidgeot": 200,
  "rhydon": 230,
  "nidoking": 250,
  "nidoqueen": 220,
  "exeggutor": 230,
  "nidoran♀": 65,
  "nidorina": 85,
  "nidoran♂": 80,
  "nidoking": 250,
  "meowth": 100,
  "persian": 180,
  "horsea": 90,
  "seadra": 160,
  "shellder": 80,
  "cloyster": 170,
  "porygon": 160,
  "snorlax": 400,
  "lapras": 300,
  "articuno": 500,
  "zapdos": 500,
  "moltres": 500,
  "dratini": 200,
  "dragonair": 250,
  "dragonite": 350,
  "tangela": 150,
  "kangaskhan": 250,
  "exeggutor": 230,
  "starmie": 230,
  "arbok": 180,
  "nidoqueen": 220,
  "scyther": 300,
  "electabuzz": 200,
  "magmar": 180,
  "machamp": 300,
  "dewgong": 220,
  "sableye": 250,
  "beldum": 250
  // Agrega más Pokémon si lo deseas...
};

module.exports = {
  name: "comprar",
  description: "Compra un Pokémon usando tus monedas.",
  commands: ["comprar"],
  usage: `${PREFIX}comprar <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    if (args.length === 0) {
      // Mostrar lista de Pokémon disponibles para comprar
      let pokemonList = "Aquí están los Pokémon que puedes comprar:\n\n";
      
      for (let pokemon in precios) {
        pokemonList += `*${pokemon}* - ${precios[pokemon]} monedas\n`;
      }

      await sendReply(pokemonList);
      return;
    }

    const pokemon = args[0]?.toLowerCase();
    if (!pokemon || !precios[pokemon]) {
      await sendReply(`❌ Debes especificar un Pokémon válido para comprar. Ejemplo: *${PREFIX}comprar pikachu*.`);
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

    // Verificar si el usuario ya tiene el Pokémon
    if (userPokemons[userJid].includes(pokemon)) {
      await sendReply(`❌ Ya tienes a *${pokemon}* en tu colección. No puedes comprarlo de nuevo.`);
      return;
    }

    // Añadir el Pokémon a la colección del usuario
    userPokemons[userJid].push(pokemon);

    // Restar las monedas del usuario
    userKrEntry.kr -= precios[pokemon];
    writeData(krFilePath, krData);
    writeData(userPokemonsFilePath, userPokemons);

    await sendReply(`✅ ¡Has comprado a *${pokemon}*! 🎉\nTe quedan ${userKrEntry.kr} monedas.`);
  },
};