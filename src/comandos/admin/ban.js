const { PREFIX, BOT_NUMBER } = require("../../krampus");
const { DangerError } = require("../../errors/DangerError");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { toUserJid, onlyNumbers } = require("../../utils");

const warnings = {}; // Objeto para almacenar las advertencias

module.exports = {
  name: "ban",
  description: "Banear",
  commands: ["ban", "kick"],
  usage: `ban`,
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    sendReply,
    userJid,
    sendBasuraReact,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "Tienes que decirme a quien quieres que elimine \n> Krampus OM bot"
      );
    }

    const memberToRemoveJid = isReply ? replyJid : toUserJid(args[0]);
    const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

    if (memberToRemoveNumber.length < 7 || memberToRemoveNumber.length > 15) {
      throw new InvalidParameterError(
        "𝙽𝚞́𝚖𝚎𝚛𝚘 in𝚟𝚊𝚕𝚒𝚍𝚘\n> Krampus OM bot"
      );
    }

    if (memberToRemoveJid === userJid) {
      throw new DangerError(
        "𝙽𝚘 𝚜𝚎 𝚙𝚞𝚎𝚍𝚎 𝚛𝚎𝚊𝚕𝚒𝚣𝚊𝚛 𝚕𝚊 𝚊𝚌𝚌𝚒𝚘́𝚗\n> Krampus OM bot"
      );
    }

    const botJid = toUserJid(BOT_NUMBER);
    if (memberToRemoveJid === botJid) {
      throw new DangerError(
        "𝙽𝚘 𝚜𝚎 𝚙𝚞𝚎𝚍𝚎 𝚛𝚎𝚊𝚕𝚒𝚣𝚊𝚛 𝚕𝚊 𝚊𝚌𝚌𝚒𝚘́𝚗\n> Krampus OM bot"
      );
    }

    // Verificar si el usuario ya ha sido advertido
    if (warnings[memberToRemoveJid]) {
      const warningTime = warnings[memberToRemoveJid].timestamp;
      const currentTime = new Date().getTime();
      const timeDiff = (currentTime - warningTime) / 1000; // Convertir a segundos

      if (timeDiff < 180) { // 3 minutos
        // Enviar segunda advertencia y banear al usuario
        await sendReply(`༎OM༎ ${toUserJid(memberToRemoveJid)} ¡Atención! Has recibido una segunda advertencia. Serás expulsado del grupo.`);
        await socket.groupParticipantsUpdate(remoteJid, [memberToRemoveJid], "remove");
        await sendBasuraReact();
        delete warnings[memberToRemoveJid];
      } else {
        // Enviar primera advertencia
        await sendReply(`༎OM༎ ${toUserJid(memberToRemoveJid)} ¡Atención! Has recibido una advertencia. Si vuelves a recibir otra advertencia en los próximos 3 minutos, serás expulsado del grupo.`);
        warnings[memberToRemoveJid] = { timestamp: new Date().getTime(), warnings: 1 };
      }
    } else {
      // Enviar primera advertencia
      await sendReply(`༎OM༎ ${toUserJid(memberToRemoveJid)} ¡Atención! Has recibido una advertencia. Si vuelves a recibir otra advertencia en los próximos 3 minutos, serás expulsado del grupo.`);
      warnings[memberToRemoveJid] = { timestamp: new Date().getTime(), warnings: 1 };
    }
  },
};
