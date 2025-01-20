const fs = require('fs');
const path = require('path');
const { PREFIX } = require("../../krampus");

const welcomeConfigPath = path.resolve(__dirname, "../../assets/welcome.json");

function getWelcomeConfig() {
  if (!fs.existsSync(welcomeConfigPath)) {
    fs.writeFileSync(welcomeConfigPath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(welcomeConfigPath, 'utf8'));
}

function setWelcomeConfig(groupId, option) {
  const config = getWelcomeConfig();
  config[groupId] = option;
  fs.writeFileSync(welcomeConfigPath, JSON.stringify(config, null, 2));
}

module.exports = {
  name: "bienvenida",
  description: "Configura la opción de bienvenida para el grupo.",
  commands: ["bienvenida", "welcome"],
  usage: `${PREFIX}bienvenida [opción]`,
  handle: async ({ args, sendReply, socket, remoteJid, participantJid }) => {
    const option = args[0];

    if (!option || !['0', '1', '2'].includes(option)) {
      await sendReply(`Por favor, proporciona una opción válida: 0 (apagar), 1 (con mensaje de bienvenida) o 2 (con foto de perfil).`);
      return;
    }

    setWelcomeConfig(remoteJid, option);
    await sendReply(`✅ La opción de bienvenida ha sido configurada a ${option === '0' ? 'apagada' : option === '1' ? 'con mensaje de bienvenida' : 'con foto de perfil'}.`);
  },
};