const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const {
    activateGoodbyeGroup,
    deactivateGoodbyeGroup,
} = require("../../utils/database");

module.exports = {
    name: "goodbye",
    description: "Activa o desactiva la despedida con texto",
    commands: ["goodbye", "despedida"],
    usage: `${PREFIX}goodbye (0/1)`,
    handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
        if (!args.length) {
            throw new InvalidParameterError(
                "\n> Krampus OM bot\nEscribe 0 o 1 para configurar la despedida:\n\n" +
                "_0_: Desactivar\n" +
                "_1_: Activar"
            );
        }

        const option = args[0];

        if (!["0", "1"].includes(option)) {
            throw new InvalidParameterError(
                "\n> Krampus OM bot\nOpción inválida. Usa:\n\n" +
                "*0*: Desactivar\n" +
                "*1*: Activar"
            );
        }

        if (option === "0") {
            deactivateGoodbyeGroup(remoteJid);
        } else {
            activateGoodbyeGroup(remoteJid);
        }

        await sendSuccessReact();

        const context =
            option === "0"
                ? "*Desactivada*"
                : "*Activada*";

        await sendReply(
            `La despedida ha sido ${context}\n> Krampus OM bot`
        );
    },
};