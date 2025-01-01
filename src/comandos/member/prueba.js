const { PREFIX } = require("../../krampus");
const axios = require("axios"); // Usaremos axios para hacer peticiones a la ruta Express
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "play-audio",
  description: "Busca y descarga audio desde YouTube",
  commands: ["play-audio", "play", "pa"],
  usage: `${PREFIX}play-audio ella me vivía`,
  handle: async ({ sendAudioFromURL, args, sendWaitReact, sendSuccessReact, sendErrorReply }) => {
    if (!args.length) {
      throw new InvalidParameterError("Você precisa me dizer o que deseja buscar!");
    }

    await sendWaitReact();

    try {
      // Enviar la solicitud a la ruta Express
      const searchQuery = args.join(" ");
      const response = await axios.get(`http://localhost:3000/audio/download?search=${encodeURIComponent(searchQuery)}`);
      
      // Si obtenemos la URL del audio
      const audioUrl = response.data.url;
      
      if (!audioUrl) {
        await sendErrorReply("Nenhum resultado encontrado!");
        return;
      }

      await sendSuccessReact();

      // Enviar el audio
      await sendAudioFromURL(audioUrl);

    } catch (error) {
      console.log(error);
      await sendErrorReply(error.message);
    }
  },
};