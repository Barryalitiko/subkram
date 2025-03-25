const { PREFIX } = require("../../krampus");
const fs = require("fs"); // Para cargar imágenes locales

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    // Cargar la imagen desde un archivo local
    let catalogo = fs.readFileSync("./media/catalogo.jpg"); // Ruta de la imagen

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
          thumbnail: catalogo, // Se usa la imagen cargada
          sellerJid: "0@s.whatsapp.net"
        }
      }
    };

    // Enviar el mensaje con el formato especial
    await socket.sendMessage(remoteJid, estilo);
  },
};
