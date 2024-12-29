const fs = require("fs");
const path = require("path");

const { PREFIX } = require("../../config");
const antispamConfigPath = path.join(__dirname, "../../assets/antispamConfig.json");

let spamTracker = {}; // Seguimiento en memoria para usuarios.

if (!fs.existsSync(antispamConfigPath)) {
  fs.writeFileSync(antispamConfigPath, JSON.stringify({}, null, 2));
}

module.exports = {
  name: "antispam",
  description: "Activa o desactiva el sistema antispam para evitar mensajes repetidos.",
  commands: ["antispam"],
  usage: `${PREFIX}antispam [on|off]`,
  handle: async ({ args, remoteJid, sendReply }) => {
    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      await sendReply(`⚠️ Uso incorrecto del comando. Usa:\n${PREFIX}antispam [on|off]`);
      return;
    }

    const antispamConfig = JSON.parse(fs.readFileSync(antispamConfigPath, "utf8"));

    if (action === "on") {
      antispamConfig[remoteJid] = { enabled: true };
      fs.writeFileSync(antispamConfigPath, JSON.stringify(antispamConfig, null, 2));
      await sendReply("✅ Sistema antispam activado en este grupo.");
    } else if (action === "off") {
      antispamConfig[remoteJid] = { enabled: false };
      fs.writeFileSync(antispamConfigPath, JSON.stringify(antispamConfig, null, 2));
      await sendReply("❌ Sistema antispam desactivado en este grupo.");
    }
  },
};

// Función para manejar el spam.
module.exports.detectSpam = async ({ message, remoteJid, sender, sendReply, socket }) => {
  const antispamConfig = JSON.parse(fs.readFileSync(antispamConfigPath, "utf8"));
  if (!antispamConfig[remoteJid]?.enabled) return;

  const userMessages = spamTracker[sender] || { messages: [], warnings: 0 };
  userMessages.messages.push(message);

  if (userMessages.messages.length > 10) {
    userMessages.messages.shift();
  }

  const lastMessages = userMessages.messages.slice(-6);
  if (lastMessages.every((msg) => msg === lastMessages[0])) {
    if (userMessages.warnings < 1) {
      userMessages.warnings += 1;
      spamTracker[sender] = userMessages;

      await sendReply(
        `⚠️ @${sender.split("@")[0]}, enviaste mensajes repetidos. Si lo haces 3 veces más, serás expulsado.`,
        [sender]
      );
    } else if (userMessages.warnings === 1) {
      try {
        await socket.groupParticipantsUpdate(remoteJid, [sender], "remove");
        delete spamTracker[sender];
        await sendReply(`🚫 @${sender.split("@")[0]} fue expulsado por spam.`, [sender]);
      } catch (error) {
        await sendReply("⚠️ No pude expulsar al usuario. ¿Soy administrador?");
      }
    }
  } else {
    userMessages.warnings = 0;
  }

  spamTracker[sender] = userMessages;
};