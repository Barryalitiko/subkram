const { PREFIX } = require("../../krampus");

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🏓");
    await sendReply(`🏓 Pong!`, {
      quoted: {
        text: "",
        url: "https://chat.whatsapp.com/F7qZTWPDTNqGALF0d9VQJC",
      },
    });
  },
};
