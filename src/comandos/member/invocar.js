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
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección.`);
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
        },
        { quoted: { jid: remoteJid } }
      );
    } catch (error) {
      console.error("Error al enviar la imagen:", error);
      await sendReply("❌ Ocurrió un error al invocar tu Pokémon.");
    }
  },
};