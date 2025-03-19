const { PREFIX } = require("../../krampus");

let usuarios = {}; // Simulación de base de datos

module.exports = {
  name: "colocar",
  description: "Coloca un objeto en tu personaje.",
  commands: ["colocar"],
  usage: `${PREFIX}colocar <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!args[0]) {
      return socket.sendMessage(remoteJid, { text: "Debes especificar qué objeto quieres colocar." });
    }

    const objeto = args[0].toLowerCase();
    const objetosDisponibles = ["gafas", "lentes"];

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    console.log(`✅ [DEBUG] Objetos del usuario ${remoteJid}:`, usuarios[remoteJid].objetos); // Depuración

    // Verificar si tiene el objeto antes de colocarlo
    if (!usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `No tienes ${objeto}. Usa #comprarobjeto ${objeto} para obtenerlo.` });
    }

    // Asegurar que solo haya un objeto tipo A1
    if (objeto === "gafas" || objeto === "lentes") {
      usuarios[remoteJid].objetos = usuarios[remoteJid].objetos.filter((o) => o !== "gafas" && o !== "lentes");
    }

    usuarios[remoteJid].objetos.push(objeto);
    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos); // Depuración

    await socket.sendMessage(remoteJid, { text: `Te has puesto ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};