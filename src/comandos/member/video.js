const { PREFIX } = require("../../krampus");
const { getVideoURL } = require("../../services/play-dl/video");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "play-video",
  description: "Descargar videos",
  commands: ["video", "v"],
  usage: `${PREFIX}video LOFI Wilmer Roberts`,
  handle: async ({
    sendVideoFromURL,
    args,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Indica el video que deseas descargar"
      );
    }

    await sendWaitReact();

    try {
      const videoUrl = await getVideoURL(args.join(" "));

      if (!videoUrl) {
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Video no encontrado");
        return;
      }

      await sendSuccessReact();
      await sendVideoFromURL(videoUrl);
    } catch (error) {
      console.log(error);
      await sendErrorReply(error.message);
    }
  },
};