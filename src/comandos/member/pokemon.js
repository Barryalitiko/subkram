const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

const preciosPokemones = {
  "pikachu": 50,
  "bulbasaur": 40,
  "charmander": 60,
  // Agrega más Pokémon aquí...
};

const preciosEvolucion = 100; // Precio del objeto de evolución 🍄

module.exports = {
  name: "tienda-pokemon",
  description: "Compra y evoluciona Pokémon con tus monedas.",
  commands: ["tienda-pokemon", "comprar-pokemon", "evolucionar"],
  usage: `${PREFIX}tienda-pokemon <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply("❌ Debes especificar un Pokémon para comprar o evolucionar.");
      return;
    }

    let krData = readData(krFilePath);
    let userKrEntry = krData.find(entry => entry.userJid === userJid);

    if (!userKrEntry) {
      userKrEntry = { userJid, kr: 0 };
      krData.push(userKrEntry);
      writeData(krFilePath, krData);
    }

    const precioPokemon = preciosPokemones[pokemon];

    if (args[0] === "evolucionar") {
      const userItems = readData(userItemsFilePath);
      const userItemEntry = userItems.find(entry => entry.userJid === userJid);

      if (!userItemEntry || userItemEntry.items["🍄"] < 1) {
        await sendReply("❌ No tienes el objeto necesario para evolucionar un Pokémon. Compra un 🍄 en la tienda.");
        return;
      }

      if (userKrEntry.kr < preciosEvolucion) {
        await sendReply(`❌ Necesitas ${preciosEvolucion} monedas para evolucionar.`);
        return;
      }

      // Resta monedas y elimina el objeto de evolución
      userKrEntry.kr -= preciosEvolucion;
      userItemEntry.items["🍄"] -= 1;

      writeData(krFilePath, krData);
      writeData(userItemsFilePath, userItems);

      await sendReply(`✅ ¡Tu Pokémon ha evolucionado! Te quedan ${userKrEntry.kr} monedas.`);
      return;
    }

    if (!precioPokemon) {
      await sendReply("❌ Este Pokémon no está disponible en la tienda.");
      return;
    }

    if (userKrEntry.kr < precioPokemon) {
      await sendReply(`❌ No tienes suficientes monedas. Necesitas ${precioPokemon} monedas para comprar ${pokemon}.`);
      return;
    }

    // Comprar el Pokémon
    userKrEntry.kr -= precioPokemon;
    writeData(krFilePath, krData);

    // Almacenar el Pokémon en el inventario del usuario
    let userItems = readData(userItemsFilePath);
    let userItemEntry = userItems.find(entry => entry.userJid === userJid);

    if (!userItemEntry) {
      userItemEntry = { userJid, items: {}, pokemons: [] };
      userItems.push(userItemEntry);
    }

    // Agregar Pokémon al inventario
    userItemEntry.pokemons.push({ name: pokemon, capturedAt: Date.now() });
    writeData(userItemsFilePath, userItems);

    // Obtener la imagen del Pokémon
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
      const pokemonData = response.data;
      const imageUrl = pokemonData.sprites.front_default;

      // Enviar mensaje de éxito con la imagen del Pokémon
      await sendReply(`✅ ¡Has comprado a ${pokemon}!\nTe quedan ${userKrEntry.kr} monedas.`);
      await sendReply({ url: imageUrl });

    } catch (error) {
      console.error(error);
      await sendReply("❌ Hubo un error al obtener la imagen del Pokémon.");
    }
  },
};