const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { DangerError } = require("../../errors/DangerError");
const { muteUser, unmuteUser } = require("../../utils/database");
const { toUserJid, onlyNumbers } = require("../../utils");

module.exports = {
  name: "mute",
  description: "Mutea o desmutea a un usuario en el grupo.",
  commands: [
    "mute1", "mute2", "mute3", "mute4", "mute5", "mute6", "mute7", "mute8", "mute9", "mute10",
    "mute11", "mute12", "mute13", "mute14", "mute15", "unmute"
  ],
  usage: `${PREFIX}muteX @usuario (donde X es el tiempo de muteo en minutos)\n${PREFIX}unmute @usuario`,
  handle: async ({ args, isReply, socket, remoteJid, replyJid, sendReply, userJid, sendSuccessReact, message }) => {
    console.log("🔹 Comando mute ejecutado.");

    // Asegurarse de que el comando reciba el mensaje
    if (!message) {
      console.log("❌ Error: El objeto 'message' es undefined.");
      return sendReply("❌ Error: El mensaje no se recibió correctamente.");
    }

    const command = args[0]?.toLowerCase();
    console.log(`🔹 Comando recibido: ${command}`);

    // Verificación de unmute
    if (command === "unmute") {
      const memberToUnmuteJid = isReply ? replyJid : toUserJid(args[1]);
      console.log(`🔹 Usuario a desmutear: ${memberToUnmuteJid}`);

      const memberToUnmuteNumber = onlyNumbers(memberToUnmuteJid);
      console.log(`🔹 Número del usuario: ${memberToUnmuteNumber}`);

      if (memberToUnmuteNumber.length < 7 || memberToUnmuteNumber.length > 15) {
        console.log("❌ Error: Número inválido.");
        return sendReply("❌ Error: Número inválido.");
      }

      unmuteUser(remoteJid, memberToUnmuteJid);
      await sendSuccessReact();
      return sendReply(`🔹 El usuario @${memberToUnmuteJid} ha sido desmuteado.`);
    }

    // Verificación de mute
    if (command.startsWith("mute")) {
      const muteTime = parseInt(command.slice(4)); // Extrae el tiempo de muteo
      if (isNaN(muteTime) || muteTime < 1 || muteTime > 15) {
        console.log("❌ Error: Tiempo de muteo inválido.");
        return sendReply("❌ Error: Debes especificar un tiempo válido entre 1 y 15 minutos.");
      }

      // Obtener el usuario a mutear
      const memberToMuteJid = isReply ? replyJid : toUserJid(args[1]);
      console.log(`🔹 Usuario a mutear: ${memberToMuteJid}`);

      const memberToMuteNumber = onlyNumbers(memberToMuteJid);
      console.log(`🔹 Número del usuario: ${memberToMuteNumber}`);

      if (memberToMuteNumber.length < 7 || memberToMuteNumber.length > 15) {
        console.log("❌ Error: Número inválido.");
        return sendReply("❌ Error: Número inválido.");
      }

      if (memberToMuteJid === userJid) {
        console.log("❌ Error: No puedes mutearte a ti mismo.");
        return sendReply("❌ Error: No puedes mutearte a ti mismo.");
      }

      const expiration = Date.now() + muteTime * 60 * 1000;
      muteUser(remoteJid, memberToMuteJid, expiration);
      await sendSuccessReact();
      return sendReply(`🔹 El usuario @${memberToMuteJid} ha sido muteado por ${muteTime} minutos.`);
    }

    // Si no es un comando válido
    return sendReply("❌ Error: Comando no reconocido.");
  }
};