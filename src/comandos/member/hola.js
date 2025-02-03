const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hola",
  description: "prueba",
  commands: ["hola"],
  usage: `${PREFIX}hola`,
  handle: async ({ socket, remoteJid }) => {
    const buttons = [
      {
        index: 0,
        urlButton: {
          displayText: "Ver canal",
          url: "https://whatsapp.com/channel/0029Vap2vVA3QxRxY4ZuD00k",
        },
      },
    ];

    const buttonMessage = {
      text: "Hola",
      buttons: buttons,
      headerType: 1,
    };

    await socket.sendMessage(remoteJid, buttonMessage);
  },
};
