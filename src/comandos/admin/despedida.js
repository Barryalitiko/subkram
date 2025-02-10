const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const {
    activateGoodbyeGroup,
    deactivateGoodbyeGroup,
    setGoodbyeMode
} = require("../../utils/database");

module.exports = {
    name: "goodbye",
    description: "Activa, desactiva o configura la despedida",
    commands: ["goodbye", "despedida"],
    usage: `${PREFIX}goodbye (0/1/2)`,
    handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
        if (!args.length) {
            throw new InvalidParameterError(
                "\n> Krampus OM bot\nEscribe 0, 1 o 2 para configurar la despedida:\n\n" +
                "_0_: Desactivar\n" +
                "_1_: Activar sin foto\n" +
                "_2_: Activar con foto"
            );
        }

        const option = args[0];

        if (!["0", "1", "2"].includes(option)) {
            throw new InvalidParameterError(
                "\n> Krampus OM bot\nOpción inválida. Usa:\n\n" +
                "*0*: Desactivar\n" +
                "*1*: Activar sin foto\n" +
                "*2*: Activar con foto"
            );
        }

        if (option === "0") {
            deactivateGoodbyeGroup(remoteJid);
        } else {
            activateGoodbyeGroup(remoteJid);
            setGoodbyeMode(remoteJid, option);
        }

        await sendSuccessReact();

        const context =
            option === "0"
                ? "*Desactivada*"
                : option === "1"
                ? "*Activada sin foto*"
                : "*Activada con foto*";

        await sendReply(
            `La despedida ha sido ${context}\n> Krampus OM bot`
        );
    },
};