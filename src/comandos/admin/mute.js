const { PREFIX, BOT_NUMBER } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { DangerError } = require("../../errors/DangerError");
const { muteUser, unmuteUser } = require("../../utils/database");
const { toUserJid, onlyNumbers } = require("../../utils");

module.exports = {
  name: "mute",
  description: "Mutea a un usuario en el grupo.",
  commands: ["mute", "unmute"],
  usage: `${PREFIX}mute @usuario\n${PREFIX}unmute @usuario`,
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    sendReply,
    userJid,
    sendReact,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "Debes indicarme a quien quieres mutear\n> Krampus OM bot"
      );
    }

    const memberToMuteJid = isReply ? replyJid : toUserJid(args[0]);
    const memberToMuteNumber = onlyNumbers(memberToMuteJid);

    if (memberToMuteNumber.length < 7 || memberToMuteNumber.length > 15) {
      throw new InvalidParameterError("Número inválido\n> Krampus OM bot");
    }

    if (memberToMuteJid === userJid) {
      throw new DangerError("No puedes mutearte a ti mismo\n> Krampus OM bot");
    }

    const botJid = toUserJid(BOT_NUMBER);
    if (memberToMuteJid === botJid) {
      throw new DangerError("No puedes mutear al bot\n> Krampus OM bot");
    }

    muteUser(remoteJid, memberToMuteJid);
    await sendReply(`El usuario @${memberToMuteJid} ha sido muteado\n> Krampus OM bot`);
    await sendReact(memberToMuteJid, "🔇");
  },
};
