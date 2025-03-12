const fs = require('fs');
const path = require('path');
const { PREFIX } = require('../../krampus');

// Rutas de archivos
const userItemsFilePath = path.resolve(process.cwd(), 'assets/userItems.json');
const userPokemonsFilePath = path.resolve(process.cwd(), 'assets/userPokemons.json');

// Evoluciones de Pokémon
const pokemonEvoluciones = {
  "mewtwo": ["mewtwo_mega_x", "mewtwo_mega_y"],
  "suicune": ["suicune_cristal"],
  "kyogre": ["kyogre_prima"],
  "groudon": ["groudon_prima"],
  "rayquaza": ["rayquaza_mega"],
  "dialga": ["dialga_temporal"],
  "palkia": ["palkia_espacial"],
  "giratina": ["giratina_forma_alterna", "giratina_forma_origen"],
  "reshiram": ["reshiram_blanco"],
  "zekrom": ["zekrom_negro"],
  "kyurem": ["kyurem_negro", "kyurem_blanco"],
  "tornadus": ["tornadus_teravolt"],
  "thundurus": ["thundurus_teravolt"],
  "landorus": ["landorus_teravolt"],
  "zygarde": ["zygarde_10%", "zygarde_50%", "zygarde_completo"],
  "hoopa": ["hoopa_unbound"],
  "necrozma": ["necrozma_amanecer", "necrozma_atardecer", "necrozma_ultra"],
  "zacian": ["zacian_corona"],
  "zamazenta": ["zamazenta_corona"],
  "eternatus": ["eternatus_eterno"],
  "urshifu": ["urshifu_estilo_uno", "urshifu_estilo_dos"],
  "calyrex": ["calyrex_glacial", "calyrex_sombrio"],
  "koraidon": ["koraidon_combativo"],
  "miraidon": ["miraidon_tecnologico"],
  "chien-pao": ["chien-pao_combativo"],
  "chi-yu": ["chi-yu_combativo"],
  "ting-lu": ["ting-lu_combativo"],
  "wo-chien": ["wo-chien_combativo"],
  "ruinous_quartet": ["ruinous_quartet_combativo"],
};

// Funciones para leer y escribir datos
const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Comando para evolucionar Pokémon
module.exports = {
  name: 'evolucionar',
  description: 'Evoluciona tu Pokémon si tienes el hongo en tu inventario.',
  commands: ['evolucionar2'],
  usage: `${PREFIX}evolucionar <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply(`Debes especificar un Pokémon para evolucionar.`);
      return;
    }

    // Leer datos de usuario
    let userPokemons = readData(userPokemonsFilePath);
    let userItems = readData(userItemsFilePath);

    // Verificar si el usuario tiene el Pokémon
    if (!userPokemons[userJid] || !userPokemons[userJid].includes(pokemon)) {
      await sendReply(`No tienes a *${pokemon}* en tu colección.`);
      return;
    }

    // Verificar si el usuario tiene el objeto
    let userItem = userItems[userJid] || { items: { hongos: 0 } };

    if (userItem.items.hongos <= 0) {
      await sendReply(`No tienes un 🍄 necesario para la evolución.`);
      return;
    }

    // Verificar si el Pokémon puede evolucionar
    if (pokemonEvoluciones[pokemon]) {
      const evolucion = pokemonEvoluciones[pokemon][0]; // Tomar la primera evolución por defecto

      // Realizar la evolución
      userPokemons[userJid] = userPokemons[userJid].filter((p) => p !== pokemon);
      userPokemons[userJid].push(evolucion);

      // Consumir el objeto
      userItem.items.hongos -= 1;

      // Guardar los cambios
      userItems[userJid] = userItem;
      writeData(userPokemonsFilePath, userPokemons);
      writeData(userItemsFilePath, userItems);

      await sendReply(`¡Felicidades! Tu *${pokemon}* ha evolucionado a *${evolucion}*!`);
    } else {
      await sendReply(`*${pokemon}* no puede evolucionar.`);
    }
  },
};