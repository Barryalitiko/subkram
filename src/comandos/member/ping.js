const { PREFIX } = require("../../krampus");

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendReplyWithLink, sendReact }) => {
    await sendReact("🏓");
    await sendReplyWithLink(`🏓 Pong!`, "https://chat.whatsapp.com/F7qZTWPDTNqGALF0d9VQJC");
  },
};
