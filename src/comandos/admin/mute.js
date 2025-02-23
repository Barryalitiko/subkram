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
message,
}) => {
console.log("Comando mute/unmute ejecutado");
console.log(`args: ${args}`);
console.log(`isReply: ${isReply}`);

if (!args.length && !isReply) {
  console.log("No se proporcionaron argumentos");
  throw new InvalidParameterError(
    "Tienes que decirme a quien quieres que mutee o desmutee"
  );
}

let command;
if (isReply) {
  command = "mute";
} else {
  command = message.toLowerCase().startsWith(`${PREFIX}mute`) ? "mute" : message.toLowerCase().startsWith(`${PREFIX}unmute`) ? "unmute" : null;
}

console.log(`Comando: ${command}`);

const memberToMuteJid = isReply ? replyJid : toUserJid(args[0]);
console.log(`Usuario a mutear: ${memberToMuteJid}`);

const memberToMuteNumber = onlyNumbers(memberToMuteJid);
console.log(`Número del usuario: ${memberToMuteNumber}`);

if (memberToMuteNumber.length < 7 || memberToMuteNumber.length > 15) {
  console.log("Número inválido");
  throw new InvalidParameterError("Número inválido");
}

if (memberToMuteJid === userJid) {
  console.log("No puedes mutearte a ti mismo");
  throw new DangerError("No puedes mutearte a ti mismo");
}

if (command === "mute") {
  console.log("Muteando usuario");
  const muteTime = parseInt(args[1]);
  console.log(`Tiempo de muteo: ${muteTime}`);

  if (isNaN(muteTime) || muteTime > 15) {
    console.log("Tiempo de muteo inválido");
    throw new InvalidParameterError("Debes especificar un tiempo válido (máximo 15 minutos)");
  }

  const expiration = Date.now() + muteTime * 60 * 1000;
  muteUser(remoteJid, memberToMuteJid, expiration);
  await sendSuccessReact();
  await sendReply(`El usuario @${memberToMuteJid} ha sido muteado por ${muteTime} minutos`);
} else if (command === "unmute") {
  console.log("Desmuteando usuario");
  unmuteUser(remoteJid, memberToMuteJid);
  await sendSuccessReact();
  await sendReply(`El usuario @${memberToMuteJid} ha sido desmuteado`);
} else {
  console.log("Comando inválido");
  throw new InvalidParameterError("Usa 'mute' o 'unmute' para silenciar o quitar el muteo a un usuario");
}
},
};

