const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const marriageFilePath = path.resolve(process.cwd(), "assets/marriage.json");

const readMarriageData = () => {
  try {
    const data = fs.readFileSync(marriageFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeMarriageData = (data) => {
  fs.writeFileSync(marriageFilePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "marry",
  description: "Proponer matrimonio a alguien. Responde a un mensaje o etiqueta a alguien.",
  commands: ["marry"],
  usage: `${PREFIX}marry @usuario o responde a un mensaje`,
  handle: async ({ socket, remoteJid, sendReply, isReply, replyJid, args, userJid }) => {
    const marriageData = readMarriageData();
    const targetJid = isReply ? replyJid : args.length > 0 ? args[0].replace("@", "") + "@s.whatsapp.net" : null;

    if (!targetJid) {
      await sendReply("❌ Debes etiquetar o responder a alguien para proponer matrimonio.");
      return;
    }

    if (targetJid === userJid) {
      await sendReply("❌ No puedes casarte contigo mismo.");
      return;
    }

    // Verificar si ambos están solteros
    const proposer = marriageData.find((entry) => entry.userJid === userJid || entry.partnerJid === userJid);
    const proposee = marriageData.find((entry) => entry.userJid === targetJid || entry.partnerJid === targetJid);

    if (proposer || proposee) {
      await sendReply("❌ Ambos deben estar solteros para casarse.");
      return;
    }

    // Enviar propuesta
    await socket.sendMessage(remoteJid, {
      text: `💍 @${userJid.split("@")[0]} ha propuesto matrimonio a @${targetJid.split("@")[0]}.\nResponde con *#si* para aceptar o *#no* para rechazar.`,
      mentions: [userJid, targetJid],
    });

    // Escuchar la respuesta
    const startTime = Date.now();
    const interval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 5 * 60 * 1000) {
        clearInterval(interval);
        await sendReply("⏳ Tiempo agotado. La propuesta de matrimonio ha sido cancelada.");
        return;
      }
    }, 5000);

    socket.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg.key.fromMe && msg.key.remoteJid === remoteJid && msg.message?.conversation) {
        const response = msg.message.conversation.toLowerCase();
        if (response === "#si" && msg.key.participant === targetJid) {
          clearInterval(interval);

          // Registrar matrimonio
          marriageData.push({
            userJid,
            partnerJid: targetJid,
            group: remoteJid,
            date: new Date().toISOString(),
            loveStreak: 0,
          });
          writeMarriageData(marriageData);

          await socket.sendMessage(remoteJid, {
            text: `💖 ¡Felicidades! @${userJid.split("@")[0]} y @${targetJid.split("@")[0]} ahora están casados.`,
            mentions: [userJid, targetJid],
          });
        } else if (response === "#no" && msg.key.participant === targetJid) {
          clearInterval(interval);
          await sendReply("💔 La propuesta de matrimonio ha sido rechazada.");
        }
      }
    });
  },
};