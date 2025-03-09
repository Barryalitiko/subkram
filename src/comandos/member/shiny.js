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

// Solo el Pokémon shiny "Pichu"
const shinyPokemon = "pichu_shiny";

module.exports = {
  name: "shiny",
  description: "Compra un *Pichu* shiny por 400 monedas.",
  commands: ["shiny"],
  usage: `${PREFIX}shiny`,
  handle: async ({ sendReply, userJid }) => {
    let krData = readData(krFilePath);
    let userKrEntry = krData.find(entry => entry.userJid === userJid);

    if (!userKrEntry || userKrEntry.kr < 400) {
      await sendReply(`❌ No tienes suficientes monedas para comprar un *Pichu* shiny. Necesitas 400 monedas.`);
      return;
    }

    // Restar las 400 monedas
    userKrEntry.kr -= 400;
    writeData(krFilePath, krData);

    let userPokemons = readData(userPokemonsFilePath);
    if (!userPokemons[userJid]) {
      userPokemons[userJid] = [];
    }

    // Verificar si el usuario ya tiene el Pichu shiny
    if (userPokemons[userJid].includes(shinyPokemon)) {
      await sendReply(`❌ Ya tienes un *Pichu* shiny en tu colección.`);
      return;
    }

    // Añadir el Pokémon shiny Pichu al inventario del usuario
    userPokemons[userJid].push(shinyPokemon);
    writeData(userPokemonsFilePath, userPokemons);

    await sendReply(`✅ ¡Has obtenido un *Pichu* shiny por 400 monedas! 🎉\nTe quedan ${userKrEntry.kr} monedas.`);
  },
};