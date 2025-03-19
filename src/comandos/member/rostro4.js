const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../../usuarios.json");

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

    // Objetos disponibles por categorías
    const objetosA = ["ojos", "naruto", "sasuke", "rinesharingan", "rinegan", "remolino"]; // Grupo A
    const objetosA1 = ["gafas", "lentes"]; // Grupo A1
    const objetosB = ["boca"]; // Grupo B (nuevo)

    const objetosDisponibles = [...objetosA, ...objetosA1, ...objetosB];

    if (!objetosDisponibles.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: "Ese objeto no está disponible para colocar." });
    }

    // Verificar si el archivo JSON existe
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
    }

    let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    // Verificar si el usuario tiene el objeto en su inventario
    if (!usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `No tienes ${objeto}. Usa #comprarobjeto ${objeto} para obtenerlo.` });
    }

    // Si el objeto es del grupo A, verificar que no tenga otro del mismo grupo
    if (objetosA.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosA.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes un objeto de tipo A colocado. Solo puedes tener uno.` });
    }

    // Si el objeto es del grupo A1, verificar que no tenga otro del mismo grupo
    if (objetosA1.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosA1.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes un objeto de tipo A1 colocado. Solo puedes tener uno.` });
    }

    // Si el objeto es del grupo B (boca), verificar que no tenga otra boca colocada
    if (objetosB.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosB.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes una boca colocada. Solo puedes tener una.` });
    }

    // Agregar el objeto al inventario del usuario
    usuarios[remoteJid].objetos.push(objeto);

    // Guardar el estado actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};