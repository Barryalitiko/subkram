const { PREFIX } = require("../../krampus");

let usuarios = {}; // Base de datos temporal

module.exports = {
  name: "quitarobjeto",
  description: "Quita el objeto colocado en tu personaje.",
  commands: ["quitarobjeto"],
  usage: `${PREFIX}quitarobjeto`,
  handle: async ({ socket, remoteJid }) => {
    if (!usuarios[remoteJid] || !usuarios[remoteJid].objetoA1) {
      return socket.sendMessage(remoteJid, { text: "No tienes ningún objeto colocado." });
    }

    const objetoQuitado = usuarios[remoteJid].objetoA1;
    usuarios[remoteJid].objetoA1 = null;

    await socket.sendMessage(remoteJid, { text: `Has quitado ${objetoQuitado} de tu personaje. Usa #personaje para verlo.` });
  },
};