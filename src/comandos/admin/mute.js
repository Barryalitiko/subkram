const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const { DangerError } = require("../../errors/DangerError");
const { muteUser, unmuteUser } = require("../../utils/database");
const { toUserJid, onlyNumbers } = require("../../utils");

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
  handle: async ({ args, isReply, socket, remoteJid, replyJid, sendReply, userJid, sendSuccessReact, message }) => {
    console.log("🔹 Comando mute ejecutado.");
    
    console.log("🔹 Parámetros recibidos:");
    console.log("args:", args);
    console.log("isReply:", isReply);
    console.log("remoteJid:", remoteJid);
    console.log("replyJid:", replyJid);
    console.log("userJid:", userJid);
    console.log("message:", message);

    if (!message) {
      console.log("❌ Error: El objeto 'message' es undefined.");
      throw new Error("Error al ejecutar el comando mute");
    }

    if (!args || args.length === 0) {
      console.log("❌ Error: No se proporcionaron argumentos.");
      throw new InvalidParameterError("Debes especificar un tiempo de muteo o 'unmute'.");
    }

    const command = args[0].toLowerCase();
    console.log(`🔹 Comando detectado: ${command}`);

    if (command === "unmute") {
      console.log("🔹 Se ejecutará el comando 'unmute'.");

      const memberToUnmuteJid = isReply ? replyJid : toUserJid(args[1]);
      console.log(`🔹 Usuario a desmutear: ${memberToUnmuteJid}`);

      if (!memberToUnmuteJid) {
        console.log("❌ Error: No se pudo obtener el JID del usuario a desmutear.");
        throw new InvalidParameterError("Menciona a un usuario o usa una respuesta.");
      }

      const memberToUnmuteNumber = onlyNumbers(memberToUnmuteJid);
      console.log(`🔹 Número del usuario: ${memberToUnmuteNumber}`);

      if (memberToUnmuteNumber.length < 7 || memberToUnmuteNumber.length > 15) {
        console.log("❌ Error: Número inválido.");
        throw new InvalidParameterError("Número inválido.");
      }

      console.log("✅ Desmuteando usuario...");
      unmuteUser(remoteJid, memberToUnmuteJid);
      await sendSuccessReact();
      await sendReply(`El usuario @${memberToUnmuteJid} ha sido desmuteado.`);
    } else {
      console.log("🔹 Se ejecutará el comando 'mute'.");

      const memberToMuteJid = isReply ? replyJid : toUserJid(args[1]);
      console.log(`🔹 Usuario a mutear: ${memberToMuteJid}`);

      if (!memberToMuteJid) {
        console.log("❌ Error: No se pudo obtener el JID del usuario a mutear.");
        throw new InvalidParameterError("Menciona a un usuario o usa una respuesta.");
      }

      const memberToMuteNumber = onlyNumbers(memberToMuteJid);
      console.log(`🔹 Número del usuario: ${memberToMuteNumber}`);

      if (memberToMuteNumber.length < 7 || memberToMuteNumber.length > 15) {
        console.log("❌ Error: Número inválido.");
        throw new InvalidParameterError("Número inválido.");
      }

      if (memberToMuteJid === userJid) {
        console.log("❌ Error: No puedes mutearte a ti mismo.");
        throw new DangerError("No puedes mutearte a ti mismo.");
      }

      const muteTime = parseInt(command.slice(4));
      console.log(`🔹 Tiempo de muteo solicitado: ${muteTime} minutos.`);

      if (isNaN(muteTime) || muteTime < 1 || muteTime > 15) {
        console.log("❌ Error: Tiempo de muteo inválido.");
        throw new InvalidParameterError("Debes especificar un tiempo válido (entre 1 y 15 minutos).");
      }

      const expiration = Date.now() + muteTime * 60 * 1000;
      console.log(`✅ Usuario será muteado hasta: ${new Date(expiration).toLocaleTimeString()}`);

      muteUser(remoteJid, memberToMuteJid, expiration);
      await sendSuccessReact();
      await sendReply(`El usuario @${memberToMuteJid} ha sido muteado por ${muteTime} minutos.`);
    }
  },
};