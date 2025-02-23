const { PREFIX, BOT_NUMBER } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { DangerError } = require("../../errors/DangerError");
const { muteUser, unmuteUser } = require("../../utils/database");
const { toUserJid, onlyNumbers } = require("../../utils");

const muteTimes = {}; // Objeto para almacenar los tiempos de muteo

module.exports = {
  name: "mute",
  description: "Mutea a un usuario en el grupo.",
  commands: [
    "mute1", "mute2", "mute3", "mute4", "mute5", 
    "mute6", "mute7", "mute8", "mute9", "mute10", 
    "mute11", "mute12", "mute13", "mute14", "mute15",
    "unmute",
  ],
  usage: `${PREFIX}muteX @usuario (donde X es el tiempo de muteo en minutos)\n${PREFIX}unmute @usuario`,
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
        "Debes indicarme a quien quieres mutear y el tiempo en minutos\n> Krampus OM bot"
      );
    }

    const command = args[0].toLowerCase(); // El comando (muteX)
    const muteTime = parseInt(command.slice(4)); // Obtener el tiempo de muteo del comando

    // Verificar si el tiempo de muteo es válido
    if (isNaN(muteTime) || muteTime < 1 || muteTime > 15) {
      throw new InvalidParameterError("Debes especificar un tiempo válido (entre 1 y 15 minutos)\n> Krampus OM bot");
    }

    const memberToMuteJid = isReply ? replyJid : toUserJid(args[1]);
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

    const expiration = Date.now() + muteTime * 60 * 1000; // Calcular el tiempo de expiración
    muteUser(remoteJid, memberToMuteJid, expiration);

    await sendReply(`El usuario @${memberToMuteJid} ha sido muteado por ${muteTime} minutos\n> Krampus OM bot`);
    await sendReact(memberToMuteJid, "🔇");

    // Almacenar el tiempo de muteo
    muteTimes[memberToMuteJid] = expiration;
  },
};