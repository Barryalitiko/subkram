const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { DangerError } = require("../../errors/DangerError");
const { muteUser, unmuteUser } = require("../../utils/database");
const { toUserJid, onlyNumbers } = require("../../utils");

module.exports = {
  name: "mute",
  description: "Mutea/desmutea a un usuario en el grupo.",
  commands: ["mute", "unmute"],
  usage: `${PREFIX}mute @usuario tiempo (para muteo)\n${PREFIX}unmute @usuario (para desmuteo)`,
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    sendReply,
    userJid,
    sendSuccessReact,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "Tienes que decirme a quien quieres que mutee o desmutee"
      );
    }

    const command = args[0].toLowerCase();
    const memberToMuteJid = isReply ? replyJid : toUserJid(args[1]);
    const memberToMuteNumber = onlyNumbers(memberToMuteJid);

    if (memberToMuteNumber.length < 7 || memberToMuteNumber.length > 15) {
      throw new InvalidParameterError("Número inválido");
    }

    if (memberToMuteJid === userJid) {
      throw new DangerError("No puedes mutearte a ti mismo");
    }

    const botJid = toUserJid(BOT_NUMBER);
    if (memberToMuteJid === botJid) {
      throw new DangerError("No puedes mutearme");
    }

    if (command === "mute") {
      const muteTime = parseInt(args[2]);
      if (isNaN(muteTime) || muteTime > 15) {
        throw new InvalidParameterError("Debes especificar un tiempo válido (máximo 15 minutos)");
      }

      const expiration = Date.now() + muteTime * 60 * 1000;
      muteUser(remoteJid, memberToMuteJid, expiration);
      await sendSuccessReact();
      await sendReply(`El usuario @${memberToMuteJid} ha sido muteado por ${muteTime} minutos`);
    } else if (command === "unmute") {
      unmuteUser(remoteJid, memberToMuteJid);
      await sendSuccessReact();
      await sendReply(`El usuario @${memberToMuteJid} ha sido desmuteado`);
    } else {
      throw new InvalidParameterError("Usa 'mute' o 'unmute' para silenciar o quitar el muteo a un usuario");
    }
  },
};
