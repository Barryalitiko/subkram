const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");

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
  name: "invocar",
  description: "Invoca un Pokémon que has comprado.",
  commands: ["invocar"],
  usage: `${PREFIX}invocar <pokemon>`,
  handle: async ({ sendReply, args, userJid, socket }) => {
    const pokemonImagenes = {
      "pikachu": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", // Imagen de Pikachu
      "bulbasaur": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",  // Imagen de Bulbasaur
      "charmander": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png", // Imagen de Charmander
      "squirtle": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",   // Imagen de Squirtle
      "eevee": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",  // Imagen de Eevee
      // Puedes agregar más Pokémon aquí con su URL correspondiente
    };

    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply(`❌ Debes especificar un Pokémon para invocar. Ejemplo: *${PREFIX}invocar pikachu*`);
      return;
    }

    let userItems = readData(userItemsFilePath);
    let userItemEntry = userItems[userJid];  // Accedemos al usuario directamente por su JID

    if (!userItemEntry || !userItemEntry.pokemones || !userItemEntry.pokemones.includes(pokemon)) {
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección. ¿Seguro que lo compraste?`);
      return;
    }

    if (!pokemonImagenes[pokemon]) {
      await sendReply(`❌ Pokémon no reconocido.`);
      return;
    }

    // Si el Pokémon está en la lista, enviamos la imagen correspondiente
    const pokemonImagen = pokemonImagenes[pokemon];

    // Enviar la imagen usando Baileys
    try {
      await socket.sendMessage(
        userJid,
        {
          image: { url: pokemonImagen }, // Usamos la URL de la imagen para enviarla
          caption: `🎉 ¡Has invocado a *${pokemon}*!`, // Mensaje que acompañará la imagen
        }
      );
    } catch (error) {
      console.error("Error al enviar la imagen:", error);
      await sendReply("❌ Ocurrió un error al invocar tu Pokémon.");
    }
  },
};

// Comando para comprar Pokémon (actualizado para añadir Pokémon a la colección)
module.exports = {
  name: "comprar",
  description: "Compra un Pokémon usando tus monedas.",
  commands: ["comprar"],
  usage: `${PREFIX}comprar <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const precios = {
      "pikachu": 100,  // Precio de Pikachu
      "bulbasaur": 80,  // Precio de Bulbasaur
      "charmander": 90,  // Precio de Charmander
      "squirtle": 85,   // Precio de Squirtle
      "eevee": 110,  // Precio de Eevee
      // Puedes agregar más Pokémon aquí con su precio correspondiente
    };

    const pokemon = args[0]?.toLowerCase();
    if (!pokemon || !precios[pokemon]) {
      await sendReply(`❌ Debes especificar un Pokémon válido para comprar. Ejemplo: *${PREFIX}comprar pikachu*`);
      return;
    }

    let krData = readData(krFilePath);
    let userKrEntry = krData.find(entry => entry.userJid === userJid);

    if (!userKrEntry || userKrEntry.kr < precios[pokemon]) {
      await sendReply(`❌ No tienes suficientes monedas para comprar *${pokemon}*. Necesitas ${precios[pokemon]} monedas.`);
      return;
    }

    let userItems = readData(userItemsFilePath);
    let userItemEntry = userItems[userJid];

    if (!userItemEntry) {
      userItemEntry = { userJid, pokemones: [] };
      userItems.push(userItemEntry);
    }

    // Añadir el Pokémon a la colección del usuario
    if (!userItemEntry.pokemones.includes(pokemon)) {
      userItemEntry.pokemones.push(pokemon);
    }

    // Restar las monedas del usuario
    userKrEntry.kr -= precios[pokemon];
    writeData(krFilePath, krData);
    writeData(userItemsFilePath, userItems);

    await sendReply(`✅ ¡Has comprado a *${pokemon}*!\nTe quedan ${userKrEntry.kr} monedas.`);
  },
};