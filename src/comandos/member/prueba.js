const { PREFIX } = require("../../krampus");
const axios = require("axios"); // Usaremos axios para hacer peticiones a la ruta Express
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const playDL = require('play-dl'); // Requiere la librería play-dl

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
      // Crear la búsqueda a partir de los argumentos
      const searchQuery = args.join(" ");
      
      // Usar play-dl para obtener el stream del audio
      const stream = await playDL.stream(searchQuery);

      // Si obtenemos la URL del audio
      const audioUrl = stream.url;
      
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