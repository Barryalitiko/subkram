const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path"); // Para manejar rutas de archivos

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    // Cargar la imagen desde la ruta especificada
    let imagePath = path.join(__dirname, "../../../assets/images/goku.jpg");
    let catalogo = fs.readFileSync(imagePath); // Leer la imagen como buffer

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
