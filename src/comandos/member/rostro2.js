const { PREFIX } = require("../../krampus");

let usuarios = {}; // Base de datos temporal

module.exports = {
  name: "comprarobjeto",
  description: "Compra un objeto para tu personaje.",
  commands: ["comprarobjeto"],
  usage: `${PREFIX}comprarobjeto <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    const objeto = args[0]?.toLowerCase();
    const objetosValidos = ["gafas", "lentes"];

    if (!objeto || !objetosValidos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: "Objeto inválido. Puedes comprar: gafas o lentes." });
    }

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [], objetoA1: null };
    }

    if (usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes ${objeto}.` });
    }

    usuarios[remoteJid].objetos.push(objeto);
    await socket.sendMessage(remoteJid, { text: `Has comprado ${objeto}. Ahora puedes colocarlo en tu personaje.` });
  },
};