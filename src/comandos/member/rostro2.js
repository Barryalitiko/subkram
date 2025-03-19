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

    // Inicializar usuario si no existe
    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    // Verificar si ya tiene el objeto
    if (usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes ${objeto}.` });
    }

    // Agregar objeto
    usuarios[remoteJid].objetos.push(objeto);
    console.log(`✅ [DEBUG] ${remoteJid} ha comprado:`, usuarios[remoteJid].objetos); // Depuración

    await socket.sendMessage(remoteJid, { text: `¡Has comprado ${objeto}! Usa #colocar ${objeto} para ponértelo.` });
  },
};