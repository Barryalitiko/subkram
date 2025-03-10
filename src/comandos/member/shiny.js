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

// Lista de Pokémon shiny disponibles
const shinyPokemons = [
  "pichu_shiny",
  "bulbasaur_shiny",
  "charmander_shiny",
  "squirtle_shiny",
  "caterpie_shiny",
  "weedle_shiny",
  "dratini_shiny",
  "larvitar_shiny",
  "pidgey_shiny",
  "rattata_shiny",
  "spearow_shiny",
  "ekans_shiny",
  "sandshrew_shiny",
  "sandshrew_alola_shiny",
  "nidoran♀_shiny",
  "vulpix_shiny",
  "vulpix_alola_shiny",
  "zubat_shiny",
  "oddish_shiny",
  "paras_shiny",
  "venonat_shiny",
  "diglett_shiny",
  "meowth_shiny",
  "meowth_alola_shiny",
  "psyduck_shiny",
  "mankey_shiny",
  "growlithe_shiny",
  "growlithe_hisui_shiny",
  "poliwag_shiny",
  "abra_shiny",
  "machop_shiny",
  "bellsprout_shiny",
  "tentacool_shiny",
  "geodude_shiny",
  "geodude_alola_shiny",
  "ponyta_shiny",
  "ponyta_galar_shiny",
  "slowpoke_shiny",
  "slowbro_mega_shiny",
  "slowpoke_galar_shiny",
  "magnemite_shiny",
  "doduo_shiny",
  "seel_shiny",
  "grimer_shiny",
  "grimer_alola_shiny",
  "shellder_shiny",
  "gastly_shiny",
  "gengar_mega_shiny",
  "drowzee_shiny",
  "krabby_shiny",
  "kingler_gmax_shiny",
  "voltorb_shiny",
  "voltorb_hisui_shiny",
  "exeggcute_shiny",
  "exeggutor_alola_shiny",
  "cubone_shiny",
  "marowak_shiny",
  "marowak_alola_shiny",
  "tyrogue_shiny",
  "koffing_shiny",
  "weezing_galar_shiny",
  "rhyhorn_shiny",
  "horsea_shiny",
  "kingdra_shiny",
  "goldeen_shiny",
  "staryu_shiny",
  "magikarp_shiny",
  "eevee_shiny",
  "omanyte_shiny",
  "kabuto_shiny",
  "dratini_shiny",
  "chikorita_shiny",
  "cyndaquil_shiny",
  "totodile_shiny",
  "sentret_shiny",
  "hoothoot_shiny",
  "ledyba_shiny",
  "spinarak_shiny",
  "chingling_shiny",
  "mareep_shiny",
  "hoppip_shiny",
  "sunkern_shiny",
  "wooper_shiny",
  "pineco_shiny",
  "teddiursa_shiny",
  "slugma_shiny",
  "swinub_shiny",
  "remoraid_shiny",
  "larvitar_shiny"
];

module.exports = {
  name: "shiny",
  description: "Compra un Pokémon shiny aleatorio.",
  commands: ["shiny"],
  usage: `${PREFIX}shiny`,
  handle: async ({ sendReply, sendReact, userJid }) => {
    let krData = readData(krFilePath);
    let userKrEntry = krData.find(entry => entry.userJid === userJid);

    if (!userKrEntry || userKrEntry.kr < 400) {
      await sendReply(`❌ No tienes suficientes monedas para comprar un Pokémon shiny. Necesitas 400 monedas.`);
      return;
    }

    // Restar las 400 monedas
    userKrEntry.kr -= 400;
    writeData(krFilePath, krData);

    let userPokemons = readData(userPokemonsFilePath);
    if (!userPokemons[userJid]) {
      userPokemons[userJid] = [];
    }

    // Seleccionar un Pokémon shiny aleatorio de la lista
    const shinyPokemon = shinyPokemons[Math.floor(Math.random() * shinyPokemons.length)];

    // Verificar si el usuario ya tiene ese shiny
    if (userPokemons[userJid].includes(shinyPokemon)) {
      await sendReply(`❌ Ya tienes un *${shinyPokemon.replace('_shiny', '').toUpperCase()}* shiny en tu colección.\n\n> Mala suerte 🙁`);
      return;
    }

    // Añadir el Pokémon shiny aleatorio al inventario del usuario
    userPokemons[userJid].push(shinyPokemon);
    writeData(userPokemonsFilePath, userPokemons);

    // Hacer las reacciones con intervalo y luego enviar el mensaje
    await sendReact('⚪️'); // Primero con ⚪️
    setTimeout(async () => {
      await sendReact('🔴'); // Después de 1 segundo con 🔴
    }, 1000);
    setTimeout(async () => {
      await sendReact('✨'); // Después de 2 segundos con ✨
      // Enviar el mensaje después de la última reacción
      await sendReply(`¡Has obtenido un *${shinyPokemon.replace('_shiny', '').toUpperCase()}* shiny.\n\nFELICIDADES!\n\n> Te quedan ${userKrEntry.kr} monedas.`);
    }, 2000); // Después de 2 segundos con ✨
  },
};