const { PREFIX } = require("../../krampus");

let usuarios = {}; // Para almacenar los datos de cada usuario (esto sería una base de datos en un caso real)

module.exports = {
  name: "comprarobjeto",
  description: "Compra un objeto para personalizar el rostro.",
  commands: ["comprarobjeto"],
  usage: `${PREFIX}comprarobjeto <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!usuarios[remoteJid] || !usuarios[remoteJid].rostro) {
      return socket.sendMessage(remoteJid, { text: "Necesitas tener un rostro antes de comprar objetos." });
    }
    
    const objeto = args.join(" ");
    if (objeto === "gafas") {
      usuarios[remoteJid].objetos.push("gafas");
      await socket.sendMessage(remoteJid, { text: "¡Gafas tipo A1 compradas!" });
    } else {
      await socket.sendMessage(remoteJid, { text: "Objeto no reconocido." });
    }
  },
};