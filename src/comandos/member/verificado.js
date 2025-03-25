const { PREFIX } = require("../../krampus");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    // Definir el mensaje con el formato `orderMessage`
    let estilo = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        ...(false ? { remoteJid: "" } : {})
      },
      message: {
        orderMessage: {
          itemCount: -999999,
          status: 1,
          surface: 1,
          message: "KrampusOM",
          orderTitle: "Bang",
          thumbnail: catalogo, // Asegúrate de definir "catalogo" en tu código
          sellerJid: "0@s.whatsapp.net"
        }
      }
    };

    // Enviar el mensaje con el formato especial
    await socket.sendMessage(remoteJid, estilo);
  },
};
