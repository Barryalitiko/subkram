const { PREFIX } = require("../../krampus");
const { getAudioURL } = require("../../services/play-dl/music");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "play-audio",
  description: "Descargar música",
  commands: ["pp", "play", "m"],
  usage: `${PREFIX}music Me echa agua DIOLI`,
  handle: async ({
    sendAudioFromURL,
    args,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Indica la canción que deseas descargar"
      );
    }

    await sendWaitReact();

    try {
      const audioUrl = await getAudioURL(args.join(" "));

      if (!audioUrl) {
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Canción no encontrada");
        return;
      }

      await sendSuccessReact();
      await sendAudioFromURL(audioUrl);
    } catch (error) {
      console.log(error);
      await sendErrorReply(error.message);
    }
  },
};