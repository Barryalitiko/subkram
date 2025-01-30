const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
} = require("../../utils/database");

module.exports = {
  name: "anti-link",
  description: "Activa/desactiva el recurso de anti-link en el grupo.",
  commands: ["anti-link"],
  usage: `${PREFIX}anti-link (1/0)`,
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "👻 Krampus.bot 👻 Activa con 1 o 0 (conectar o desconectar)!"
      );
    }

    const antiLinkOn = args[0] === "1";
    const antiLinkOff = args[0] === "0";

    if (!antiLinkOn && !antiLinkOff) {
      throw new InvalidParameterError(
        "👻Krampus.bot👻 Activa con 1 o 0 (conectar o desconectar)!"
      );
    }

    if (antiLinkOn) {
      activateAntiLinkGroup(remoteJid);
    } else {
      deactivateAntiLinkGroup(remoteJid);
    }

    await sendSuccessReact();

    const context = antiLinkOn ? "activado" : "desactivado";

    await sendReply(`El anti-link ha sido ${context}!`);
  },
};
