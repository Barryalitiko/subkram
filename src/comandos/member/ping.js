const { PREFIX } = require("../../krampus");

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendReply, sendReact }) => {
    const link = "https://chat.whatsapp.com/F7qZTWPDTNqGALF0d9VQJC";
    const title = "Únete al grupo de WhatsApp";
    const description = "Haz clic para unirte al grupo";
    const thumbnail = "https://images.vexels.com/media/users/3/215556/isolated/preview/56cab15c9dd85351a1546bdfa86b9dd6-gato-acostado-mullido-plano.png";
    await sendReact("👻");
    return {
      text: `Operación Marshall\n> Krampus OM bot`,
      media: {
        url: thumbnail,
        caption: `${title}\n${description}\n\n${link}`,
      },
    };
  },
};
