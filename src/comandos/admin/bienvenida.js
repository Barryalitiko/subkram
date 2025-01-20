const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const {
  activateWelcomeGroup,
  deactivateWelcomeGroup,
  setWelcomeMode,
} = require("../../utils/database");

module.exports = {
  name: "welcome",
  description: "Activa, desactiva o configura el saludo de bienvenida.",
  commands: ["welcome", "bienvenida"],
  usage: `${PREFIX}welcome (0/1/2)`,
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 Escribe 0, 1 o 2 para configurar la bienvenida:\n\n" +
        "*0*: Desactivar\n" +
        "*1*: Activar con foto\n" +
        "*2*: Activar sin foto"
      );
    }

    const option = args[0];

    if (!["0", "1", "2"].includes(option)) {
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 Opción inválida. Usa:\n\n" +
        "*0*: Desactivar\n" +
        "*1*: Activar con foto\n" +
        "*2*: Activar sin foto"
      );
    }

    if (option === "0") {
      deactivateWelcomeGroup(remoteJid);
    } else {
      activateWelcomeGroup(remoteJid);
      setWelcomeMode(remoteJid, option);
    }

    await sendSuccessReact();

    const context =
      option === "0"
        ? "Desactivada"
        : option === "1"
        ? "Activada con foto"
        : "Activada sin foto";

    await sendReply(
      `👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 La bienvenida ha sido configurada como: *${context}*.`
    );
  },
};