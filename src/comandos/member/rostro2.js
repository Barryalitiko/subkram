const { PREFIX } = require("../../krampus");

let usuarios = {}; // Simulación de base de datos

module.exports = {
  name: "comprarobjeto",
  description: "Compra un objeto y lo añade a tu inventario.",
  commands: ["comprarobjeto"],
  usage: `${PREFIX}comprarobjeto <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!args[0]) {
      return socket.sendMessage(remoteJid, { text: "Debes especificar qué objeto quieres comprar." });
    }

    const objeto = args[0].toLowerCase(); // Convertir a minúsculas
    const objetosDisponibles = ["gafas", "lentes"];

    if (!objetosDisponibles.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: "Ese objeto no está disponible para comprar." });
    }

    // Asegurar que el usuario tenga un espacio en la "base de datos"
    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    // Verificar si ya lo tiene
    if (usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes ${objeto}.` });
    }

    // Agregar objeto al usuario
    usuarios[remoteJid].objetos.push(objeto);
    await socket.sendMessage(remoteJid, { text: `¡Has comprado ${objeto}! Usa #colocar ${objeto} para ponértelo.` });
  },
};