const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { autoReactions } = require("../utils/autoReactions");
const { isSpamDetectionActive } = require("../utils/database");
const { onlyNumbers } = require("../utils"); // Asegúrate de importar esta función si no la tienes

const spamDetection = {}; // Almacena los mensajes repetidos por usuario

exports.onMessagesUpsert = async ({ socket, messages }) => {
  if (!messages.length) {
    return;
  }

  for (const webMessage of messages) {
    const commonFunctions = loadCommonFunctions({ socket, webMessage });
    if (!commonFunctions) {
      continue;
    }

    const messageText = webMessage.message.conversation;
    const remoteJid = webMessage.key.remoteJid;
    const senderJid = webMessage.key.participant || webMessage.key.remoteJid;

    // Verifica si la detección de spam está activada en este grupo
    if (isSpamDetectionActive(remoteJid)) {
      if (!spamDetection[remoteJid]) {
        spamDetection[remoteJid] = {};
      }

      if (!spamDetection[remoteJid][senderJid]) {
        spamDetection[remoteJid][senderJid] = { text: messageText, count: 1 };
      } else {
        if (spamDetection[remoteJid][senderJid].text === messageText) {
          spamDetection[remoteJid][senderJid].count++;
        } else {
          spamDetection[remoteJid][senderJid] = { text: messageText, count: 1 };
        }
      }

      // Si el usuario envió el mismo mensaje 5 veces seguidas, lo expulsa
      if (spamDetection[remoteJid][senderJid].count >= 5) {
        await socket.groupParticipantsUpdate(remoteJid, [senderJid], "remove");
        await socket.sendMessage(remoteJid, {
          text: `🚫 Eliminé a @${onlyNumbers(senderJid)} porque intentó hacer *spam*`,
          mentions: [senderJid],
        });
        delete spamDetection[remoteJid][senderJid]; // Reinicia el contador
      }
    }

    // Auto Reacciones
    for (const [keyword, emoji] of Object.entries(autoReactions)) {
      if (messageText.toLowerCase().includes(keyword)) {
        await socket.sendMessage(remoteJid, {
          react: {
            text: emoji,
            key: webMessage.key,
          },
        });
      }
    }

    // Comandos dinámicos
    await dynamicCommand(commonFunctions);
  }
};