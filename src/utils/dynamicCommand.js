const { DangerError } = require("../errors/DangerError");
const { InvalidParameterError } = require("../errors/InvalidParameterError");
const { WarningError } = require("../errors/WarningError");
const { findCommandImport } = require(".");
const { verifyPrefix, hasTypeOrCommand, isLink, isAdmin } = require("../middlewares");
const { checkPermission } = require("../middlewares/checkPermission");
const { isActiveAntiLinkGroup, getAntiLinkMode, isUserMuted, getMuteExpiration, unmuteUser } = require("./database");
const { errorLog } = require("../utils/logger");
const { ONLY_GROUP_ID } = require("../krampus");

function isGroupLink(message) {
  return message.includes("chat.whatsapp.com");
}

exports.dynamicCommand = async (paramsHandler) => {
  const {
    commandName,
    prefix,
    sendWarningReply,
    sendErrorReply,
    remoteJid,
    sendReply,
    socket,
    userJid,
    fullMessage,
    webMessage,
  } = paramsHandler;

  // Verificación si el usuario está muteado
  if (await isUserMuted(remoteJid, userJid)) {
    const muteExpiration = await getMuteExpiration(remoteJid, userJid);
    const timeLeft = muteExpiration - Date.now();
    if (timeLeft > 0) {
      await sendReply(`🛑 Estás muteado. Te quedan ${Math.ceil(timeLeft / 60000)} minutos.`);
      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid,
          fromMe: false,
          id: webMessage.key.id,
          participant: webMessage.key.participant,
        },
      });
      return;
    } else {
      // El muteo ha expirado, se elimina el muteo del usuario
      await unmuteUser(remoteJid, userJid);
    }
  }

  if (isActiveAntiLinkGroup(remoteJid) && isLink(fullMessage)) {
    const antiLinkMode = getAntiLinkMode(remoteJid);
    if (
      antiLinkMode === "2" ||
      (antiLinkMode === "1" && isGroupLink(fullMessage))
    ) {
      if (!(await isAdmin({ remoteJid, userJid, socket }))) {
        await socket.groupParticipantsUpdate(remoteJid, [userJid], "remove");
        await sendReply(
          "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 Baneado por enviar link"
        );
        await socket.sendMessage(remoteJid, {
          delete: {
            remoteJid,
            fromMe: false,
            id: webMessage.key.id,
            participant: webMessage.key.participant,
          },
        });
        return;
      }
    }
  }

  const { type, command } = findCommandImport(commandName);
  if (ONLY_GROUP_ID && ONLY_GROUP_ID !== remoteJid) {
    return;
  }

  if (!verifyPrefix(prefix) || !hasTypeOrCommand({ type, command })) {
    return;
  }

  if (!(await checkPermission({ type, ...paramsHandler }))) {
    await sendErrorReply(
      "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No tienes permitido usar el comando"
    );
    return;
  }

  try {
    await command.handle({ ...paramsHandler, type });
  } catch (error) {
    if (error instanceof InvalidParameterError) {
      await sendWarningReply(`Parametros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      await sendWarningReply(error.message);
    } else if (error instanceof DangerError) {
      await sendErrorReply(error.message);
    } else {
      errorLog("Error al ejecutar el comando", error);
      await sendErrorReply(
        `👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 Ocurrio un error al ejecutar el comando ${command.name}! 📄 *Detalles*: ${error.message}`
      );
    }
  }
};

// Evento para eliminar mensajes de usuarios muteados
socket.ev.on("messages.upsert", async ({ messages, type }) => {
  if (type !== "notify") return;

  const message = messages[0];
  const senderJid = message.key.fromMe ? BOT_NUMBER : message.key.remoteJid;
  const userJid = message.key.participant;

  if (await isUserMuted(message.key.remoteJid, userJid)) {
    await socket.sendMessage(message.key.remoteJid, {
      delete: "forEveryone",
      remoteJid: message.key.remoteJid,
      fromMe: false,
      id: message.key.id,
      participant: message.key.participant,
    });
  }
});
