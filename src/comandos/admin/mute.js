const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { muteUser, unmuteUser, getMuteExpiration } = require("../../utils/database");

module.exports = {
name: "mute",
description: "Mutea/desmutea a un usuario en el grupo.",
commands: ["mute", "unmute"],
usage: `${PREFIX}mute @usuario tiempo (para muteo)\n${PREFIX}unmute @usuario (para desmuteo)`,
handle: async ({ args, sendReply, sendSuccessReact, remoteJid, userJid, socket }) => {
if (!args.length) {
return sendReply(`👻 Krampus.bot 👻 Para muteo, usa: ${PREFIX}mute @usuario tiempo\nPara desmuteo: ${PREFIX}unmute @usuario`);
}

const command = args[0].toLowerCase();
const targetUser = args[1];

if (!targetUser) {
  return sendReply(`👻 Krampus.bot 👻 Debes especificar un usuario.`);
}

if (command === "mute") {
  const muteTime = parseInt(args[2]);
  if (isNaN(muteTime) || muteTime > 15) {
    return sendReply(`👻 Krampus.bot 👻 Debes especificar un tiempo válido (máximo 15 minutos).`);
  }

  const expiration = Date.now() + muteTime * 60 * 1000;
  muteUser(remoteJid, targetUser, expiration);
  await sendSuccessReact();
  await sendReply(`El usuario @${targetUser} ha sido muteado por ${muteTime} minutos.`);
} else if (command === "unmute") {
  unmuteUser(remoteJid, targetUser);
  await sendSuccessReact();
  await sendReply(`El usuario @${targetUser} ha sido desmuteado.`);
} else {
  return sendReply(`👻 Krampus.bot 👻 Usa 'mute' o 'unmute' para silenciar o quitar el muteo a un usuario.`);
}
},
};