const axios = require("axios");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "invocar",
  description: "Invoca a un Pokémon.",
  commands: ["invocar"],
  usage: `${PREFIX}invocar <nombre_del_pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply("❌ Debes especificar un Pokémon.");
      return;
    }

    // Obtener la imagen del Pokémon usando la API de Pokémon
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
      const pokemonData = response.data;

      // Obtener la URL de la imagen
      const imageUrl = pokemonData.sprites.front_default;

      // Si la imagen está disponible, la enviamos
      if (imageUrl) {
        await sendReply({ url: imageUrl });
      } else {
        await sendReply("❌ No se pudo obtener la imagen de este Pokémon.");
      }
    } catch (error) {
      console.error(error);
      await sendReply("❌ Hubo un error al invocar al Pokémon.");
    }
  },
};