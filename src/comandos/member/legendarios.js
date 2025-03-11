const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};  
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Lista de Pokémon legendarios con precios
const precios = {
  "articuno": 1000,
  "zapdos": 1100,
  "moltres": 1100,
  "raikou": 1200,
  "entei": 1200,
  "suicune": 1300,
  "regirock": 1400,
  "regice": 1400,
  "registeel": 1400,
  "latias": 1500,
  "latios": 1500,
  "heatran": 1600,
  "regigigas": 1700,
  "cresselia": 1800,
  "cobalion": 1900,
  "terrakion": 1900,
  "virizion": 1900,
  "tornadus": 2000,
  "thundurus": 2000,
  "landorus": 2100,
  "tapukoko": 2200,
  "tapulele": 2200,
  "tapubulu": 2200,
  "tapufini": 2200,
  "solgaleo": 2300,
  "lunala": 2300,
  "zacian": 2400,
  "zamazenta": 2400,
  "eternatus": 2500,
  "koraidon": 2600,
  "miraidon": 2600
};

module.exports = {
  name: "legendarios",
  description: "Compra Pokémon legendarios con tus monedas.",
  commands: ["capturarlegendario"],
  usage: `${PREFIX}legendarios <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const pokemon = args[0]?.toLowerCase();

    if (!pokemon) {
      let listaPrecios = "🟡 *Lista de Pokémon legendarios disponibles*:\n\n> Usa #capturarlegendario nombredelpokemon para comprarlo\n";
      
      for (const [nombre, precio] of Object.entries(precios)) {
        listaPrecios += `- ${nombre}: ${precio} monedas\n`;
      }
      listaPrecios += `\nUsa *${PREFIX}capturarlegendario <pokemon>* para comprar.\n> Ejemplo: *#capturarlegendario zapdos*`;
      await sendReply(listaPrecios);
      return;
    }

    if (!precios[pokemon]) {
      await sendReply("❌ Pokémon inválido. Usa el comando sin argumentos para ver la lista de legendarios.");
      return;
    }

    let krData = readData(krFilePath);
    if (!krData.find(entry => entry.userJid === userJid)) {
      krData.push({ userJid, kr: 0 });
    }
    const userKr = krData.find(entry => entry.userJid === userJid).kr;

    if (userKr < precios[pokemon]) {
      await sendReply(`❌ No tienes suficientes monedas para capturar a *${pokemon}*.\n> Necesitas ${precios[pokemon]} monedas.`);
      return;
    }

    let userPokemons = readData(userPokemonsFilePath);
    if (!userPokemons[userJid]) {
      userPokemons[userJid] = [];
    }
    if (userPokemons[userJid].includes(pokemon)) {
      await sendReply(`❌ Ya tienes un *${pokemon}* en tu colección.`);
      return;
    }

    userPokemons[userJid].push(pokemon);
    writeData(userPokemonsFilePath, userPokemons);

    const userKrBalance = userKr - precios[pokemon];
    krData = krData.map(entry => entry.userJid === userJid ? { userJid, kr: userKrBalance } : entry);
    writeData(krFilePath, krData);

    await sendReply(`¡Has capturado a *${pokemon}*! 🎉\n\nUsa #pokedex para ver tu colección.\n> Te quedan *${userKrBalance}* monedas.`);
  },
};