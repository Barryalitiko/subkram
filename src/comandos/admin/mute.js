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
    "mute1", "mute2", "mute3", "mute4", "unmute",
  ],
  usage: `${PREFIX}muteX @usuario (donde X es el tiempo de muteo: 1, 2, 3 o 4)\n${PREFIX}unmute @usuario`,
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
        "Debes indicarme a quien quieres mutear y el comando de muteo\n> Krampus OM bot"
      );
    }

    const command = args[0].toLowerCase(); // El comando (muteX)

    // Verificar si el comando es uno de los permitidos
    const validMuteCommands = ["mute1", "mute2", "mute3", "mute4"];
    if (!validMuteCommands.includes(command)) {
      throw new InvalidParameterError(
        "El comando de muteo debe ser uno de los siguientes: mute1, mute2, mute3, mute4\n> Krampus OM bot"
      );
    }

    let muteTime;

    // Asignar el tiempo de muteo según el comando
    switch (command) {
      case "mute1":
        muteTime = 1; // 1 minuto
        break;
      case "mute2":
        muteTime = 3; // 3 minutos
        break;
      case "mute3":
        muteTime = 4; // 4 minutos
        break;
      case "mute4":
        muteTime = 5; // 5 minutos
        break;
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

    await sendReply(`El usuario @${memberToMuteJid} ha sido muteado por ${muteTime} minuto(s)\n> Krampus OM bot`);
    await sendReact(memberToMuteJid, "🔇");

    // Almacenar el tiempo de muteo
    muteTimes[memberToMuteJid] = expiration;
  },
};