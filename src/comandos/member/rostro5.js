const { PREFIX } = require("../../krampus");

let usuarios = {}; // Simulación de base de datos

module.exports = {
  name: "quitar",
  description: "Quita un objeto de tu personaje.",
  commands: ["quitar"],
  usage: `${PREFIX}quitar <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!args[0]) {
      return socket.sendMessage(remoteJid, { text: "Debes especificar qué objeto quieres quitar." });
    }

    const objeto = args[0].toLowerCase();

    if (!usuarios[remoteJid] || !usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `No tienes ${objeto} puesto.` });
    }

    // Quitar objeto
    usuarios[remoteJid].objetos = usuarios[remoteJid].objetos.filter((o) => o !== objeto);
    await socket.sendMessage(remoteJid, { text: `Te has quitado ${objeto}.` });
  },
};