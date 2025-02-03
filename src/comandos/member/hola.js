const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hola",
  description: "prueba",
  commands: ["hola"],
  usage: `${PREFIX}hola`,
  handle: async ({ socket, remoteJid, sendReplyWithButton }) => {
    const buttons = [
      {
        buttonId: "ver_canal",
        buttonText: "Ver canal",
        type: 1,
        url: "https://whatsapp.com/channel/0029Vap2vVA3QxRxY4ZuD00k",
      },
    ];

    await sendReplyWithButton("Hola", buttons);
  },
};
