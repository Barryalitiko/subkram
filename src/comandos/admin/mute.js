const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const {
  muteUser,
  unmuteUser,
  getMuteExpiration,
} = require("../../utils/database");

module.exports = {
  name: "mute",
  description: "Mutea/desmutea a un usuario en el grupo.",
  commands: ["mute", "unmute"],
  usage: `${PREFIX}mute @usuario tiempo (para muteo)\n${PREFIX}unmute @usuario (para desmuteo)`,
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid, userJid, socket }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "👻 Krampus.bot 👻 Para muteo, usa: `${PREFIX}mute @usuario tiempo`\nPara desmuteo: `${PREFIX}unmute @usuario`"
      );
    }

    const command = args[0].toLowerCase();
    
    if (command === "mute") {
      // Muteo
      const targetUser = args[1]; // @usuario
      const muteTime = parseInt(args[2]); // tiempo en minutos

      if (!targetUser || isNaN(muteTime)) {
        throw new InvalidParameterError(
          "👻 Krampus.bot 👻 Debes especificar un usuario y un tiempo válido (máximo 15 minutos)."
        );
      }

      if (muteTime > 15) {
        throw new InvalidParameterError("👻 Krampus.bot 👻 El tiempo de muteo no puede exceder los 15 minutos.");
      }

      // Muteo al usuario
      const expiration = Date.now() + muteTime * 60 * 1000;
      muteUser(remoteJid, targetUser, expiration); // Almacena el tiempo de expiración

      await sendSuccessReact();
      await sendReply(`El usuario @${targetUser} ha sido muteado por ${muteTime} minutos.`);

    } else if (command === "unmute") {
      // Desmuteo
      const targetUser = args[1]; // @usuario

      if (!targetUser) {
        throw new InvalidParameterError(
          "👻 Krampus.bot 👻 Debes especificar un usuario para desmutear."
        );
      }

      // Desmuteo al usuario
      unmuteUser(remoteJid, targetUser); // Elimina al usuario de la lista de muteados

      await sendSuccessReact();
      await sendReply(`El usuario @${targetUser} ha sido desmuteado.`);
    } else {
      throw new InvalidParameterError(
        "👻 Krampus.bot 👻 Usa `mute` o `unmute` para silenciar o quitar el muteo a un usuario."
      );
    }
  },
};