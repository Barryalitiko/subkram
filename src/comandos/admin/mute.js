const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { DangerError } = require("../../errors/DangerError");
const { muteUser, unmuteUser } = require("../../utils/database");
const { toUserJid, onlyNumbers } = require("../../utils");

module.exports = {
name: "mute",
description: "Mutea a un usuario en el grupo.",
commands: [
"mute1",
"mute2",
"mute3",
"mute4",
"mute5",
"mute6",
"mute7",
"mute8",
"mute9",
"mute10",
"mute11",
"mute12",
"mute13",
"mute14",
"mute15",
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
sendSuccessReact,
message,
}) => {
console.log("Comando mute ejecutado");
console.log(`args: ${args}`);
console.log(`isReply: ${isReply}`);

const command = message.toLowerCase().split(" ")[0].slice(PREFIX.length);
console.log(`Comando: ${command}`);

if (command === "unmute") {
  const memberToUnmuteJid = isReply ? replyJid : toUserJid(args[0]);
  console.log(`Usuario a desmutear: ${memberToUnmuteJid}`);

  const memberToUnmuteNumber = onlyNumbers(memberToUnmuteJid);
  console.log(`Número del usuario: ${memberToUnmuteNumber}`);

  if (memberToUnmuteNumber.length < 7 || memberToUnmuteNumber.length > 15) {
    console.log("Número inválido");
    throw new InvalidParameterError("Número inválido");
  }

  unmuteUser(remoteJid, memberToUnmuteJid);
  await sendSuccessReact();
  await sendReply(`El usuario @${memberToUnmuteJid} ha sido desmuteado`);
} else {
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

  const muteTime = parseInt(command.slice(4)); // Obtener el tiempo de muteo del comando
  console.log(`Tiempo de muteo: ${muteTime}`);

  if (isNaN(muteTime) || muteTime < 1 || muteTime > 15) {
    console.log("Tiempo de muteo inválido");
    throw new InvalidParameterError("Debes especificar un tiempo válido (entre 1 y 15 minutos)");
  }

  const expiration = Date.now() + muteTime * 60 * 1000;
  muteUser(remoteJid, memberToMuteJid, expiration);
  await sendSuccessReact();
  await sendReply(`El usuario @${memberToMuteJid} ha sido muteado por ${muteTime} minutos`);
}
},
};