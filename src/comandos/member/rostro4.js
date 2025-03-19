const { PREFIX } = require("../../krampus");

let usuarios = {}; // Base de datos temporal

module.exports = {
  name: "colocar",
  description: "Coloca un objeto en tu personaje.",
  commands: ["colocar"],
  usage: `${PREFIX}colocar <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    const objeto = args[0]?.toLowerCase();
    const objetosA1 = ["gafas", "lentes"];

    if (!objeto || !objetosA1.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: "Objeto inválido. Puedes colocar: gafas o lentes." });
    }

    if (!usuarios[remoteJid] || !usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `No tienes ${objeto}. Primero cómpralo con #comprarobjeto ${objeto}.` });
    }

    // Si ya hay un objeto A1 colocado, lo quitamos antes de poner el nuevo
    if (usuarios[remoteJid].objetoA1 && usuarios[remoteJid].objetoA1 !== objeto) {
      await socket.sendMessage(remoteJid, { text: `Has quitado ${usuarios[remoteJid].objetoA1} para colocar ${objeto}.` });
    }

    // Colocar el nuevo objeto A1
    usuarios[remoteJid].objetoA1 = objeto;
    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto} en tu personaje. Usa #personaje para verlo.` });
  },
};