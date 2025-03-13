const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");
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

// Definir los precios para los objetos y Pokémon (agregar más Pokémon aquí)
const precios = {
  // Generación 1
  "articuno": 2000,
  "zapdos": 2000,
  "moltres": 2000,
  "mewtwo": 2500,
  "mew": 2500,

  // Generación 2
  "suicune": 2200,
  "entei": 2200,
  "raikou": 2200,
  "lugia": 2300,
  "ho-oh": 2300,
  "celebi": 2400,

  // Generación 3
  "regirock": 2100,
  "regice": 2100,
  "registeel": 2100,
  "latias": 2300,
  "latios": 2300,
  "kyogre": 2400,
  "groudon": 2400,
  "rayquaza": 2500,
  "jirachi": 2400,
  "deoxys": 2400,

  // Generación 4
  "dialga": 2400,
  "palkia": 2400,
  "giratina": 2400,
  "arceus": 2500,
  "uxie": 2300,
  "azelf": 2300,
  "mesprit": 2300,
  "darkrai": 2400,
  "shaymin": 2400,

  // Generación 5
  "reshiram": 2400,
  "zekrom": 2400,
  "kyurem": 2400,
  "cobalion": 2300,
  "terrakion": 2300,
  "virizion": 2300,
  "tornadus": 2300,
  "thundurus": 2300,
  "landorus": 2300,
  "victini": 2400,

  // Generación 6
  "xerneas": 2400,
  "yveltal": 2400,
  "zygarde": 2400,
  "diancie": 2300,
  "hoopa": 2400,
  "volcanion": 2300,

  // Generación 7
  "solgaleo": 2400,
  "lunala": 2400,
  "necrozma": 2400,
  "tapu_lele": 2300,
  "tapu_bulu": 2300,
  "tapu_fini": 2300,
  "cosmog": 2300,
  "magearna": 2400,
  "marshadow": 2400,

  // Generación 8
  "zacian": 2400,
  "zamazenta": 2400,
  "eternatus": 2400,
  "kubfu": 2300,
  "urshifu": 2400,

  // Generación 9
  "koraidon": 2400,
  "miraidon": 2400,
  "chien-pao": 2300,
  "chi-yu": 2300,
  "ting-lu": 2300,
  "wo-chien": 2300,
  "ruinous_quartet": 2400,
  "slither_wing": 2300,
  "iron_leaves": 2300,
  "walking_wake": 2300,
  "iron_crown": 2400,
};


module.exports = {
  name: "tienda",
  description: "Compra objetos en la tienda con tus monedas.",
  commands: ["legendario"],
  usage: `${PREFIX}tienda <objeto>`,
  handle: async ({ sendReply, args, userJid }) => {
    const objeto = args[0]?.toLowerCase();

    if (!objeto) {
      // Mostrar lista de objetos disponibles para comprar
      let listaPrecios = "⚡️*Legendarios disponibles*:\n\n> Usa #legendario nombredelpokemon para comprarlo\n";
      
      for (const [item, precio] of Object.entries(precios)) {
        listaPrecios += `- ${item}: ${precio} monedas\n`;
      }
      listaPrecios += `\nUsa *${PREFIX}legendario <pokemon>* para comprar.\n> Por ejemplo *#legendario pichu*`;
      await sendReply(listaPrecios);
      return;
    }

    if (!precios[objeto]) {
      await sendReply("❌ Objeto inválido. Usa el comando de forma correcta para ver la lista de objetos.");
      return;
    }

    let krData = readData(krFilePath);
    if (!krData.find(entry => entry.userJid === userJid)) {
      krData.push({ userJid, kr: 0 });
    }
    const userKr = krData.find(entry => entry.userJid === userJid).kr;

    if (userKr < precios[objeto]) {
      await sendReply(`❌ No tienes suficientes monedas para tener un ${objeto}.\n> Necesitas ${precios[objeto]} monedas.`);
      return;
    }

    let userItems = readData(userItemsFilePath);
    if (typeof userItems !== 'object' || !Array.isArray(userItems)) {
      userItems = [];
    }
    if (!userItems.find(entry => entry.userJid === userJid)) {
      userItems.push({ userJid, items: { hongos: 0 } });
    }
    const userItem = userItems.find(entry => entry.userJid === userJid);

    // Agregar el Pokémon a la colección del usuario si no lo tiene
    if (precios[objeto]) {
      let userPokemons = readData(userPokemonsFilePath);
      if (!userPokemons[userJid]) {
        userPokemons[userJid] = [];
      }
      if (userPokemons[userJid].includes(objeto)) {
        await sendReply(`❌ Ya tienes un *${objeto}* en tu colección.`);
        return;
      }
      userPokemons[userJid].push(objeto);  // Agregar el Pokémon a la colección
      writeData(userPokemonsFilePath, userPokemons);
    }

    const userKrBalance = userKr - precios[objeto];
    krData = krData.map(entry => entry.userJid === userJid ? { userJid, kr: userKrBalance } : entry);
    userItems = userItems.map(entry => entry.userJid === userJid ? userItem : entry);

    writeData(userItemsFilePath, userItems);
    writeData(krFilePath, krData);

    await sendReply(`¡Has añadido a ${objeto}!\n\nUsa #pokedex para ver tus pokemons\n> Te ${userKrBalance} monedas.`);
  },
};