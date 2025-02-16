const { PREFIX } = require("../../krampus");

module.exports = {
  name: "ping",
  description: "Verificar se o bot está online",
  commands: ["ping"],
  usage: `${PREFIX}om`,
  handle: async ({ sendReply, sendReact }) => {
    const link = "https://chat.whatsapp.com/F7qZTWPDTNqGALF0d9VQJC";
    const title = "Únete al grupo de WhatsApp";
    const description = "Haz clic para unirte al grupo";
    const thumbnail = "https://images.vexels.com/media/users/3/215556/isolated/preview/56cab15c9dd85351a1546bdfa86b9dd6-gato-acostado-mullido-plano.png"; // reemplaza con una imagen de thumbnail

    await sendReact("👻");
    await sendReply({
      text: `Operación Marshall\n> Krampus OM bot`,
      link: {
        title,
        description,
        thumbnail,
        url: link
      }
    });
  }
};




