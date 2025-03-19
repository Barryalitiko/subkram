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
    const objetosDisponibles = ["gafas", "lentes", "ojos", "naruto"];  // Añadimos "naruto" a la lista

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

    // Verificar que no tenga más de un objeto del mismo tipo A o A1
    const objetosA = ["ojos", "naruto"];
    const objetosA1 = ["gafas", "lentes"];

    // Si el objeto es A (ojos, naruto), verificar que solo tenga uno
    if (objetosA.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosA.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes un objeto de tipo A colocado (ojos o naruto). Solo puedes tener uno.` });
    }

    // Si el objeto es A1 (gafas, lentes), verificar que solo tenga uno
    if (objetosA1.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosA1.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes un objeto de tipo A1 colocado (gafas o lentes). Solo puedes tener uno.` });
    }

    // Agregar el objeto al inventario del usuario
    usuarios[remoteJid].objetos.push(objeto);

    // Guardar el estado actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};