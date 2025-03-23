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
    const objetosA = ["ojos", "naruto", "sasuke", "rinesharingan", "rinegan", "remolino"]; // Grupo A (ojos)
    const objetosA1 = ["gafas", "lentes"]; // Grupo A1 (gafas/lentes)
    const objetosB = ["labios", "bocamorada", "bocaroja", "bocaalegre", "labiosnormales"]; // Grupo B (bocas)
    const objetosZ = ["tortuga", "love"]; // Grupo Z (animaciones)

    const objetosDisponibles = [...objetosA, ...objetosA1, ...objetosB, ...objetosZ];

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

    // Verificar si ya tiene un objeto del mismo tipo colocado
    if (objetosA.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosA.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes un objeto de tipo A colocado. Solo puedes tener uno.` });
    }

    if (objetosA1.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosA1.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes un objeto de tipo A1 colocado. Solo puedes tener uno.` });
    }

    if (objetosB.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosB.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes una boca colocada. Solo puedes tener una.` });
    }

    if (objetosZ.includes(objeto) && usuarios[remoteJid].objetos.some(o => objetosZ.includes(o))) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes una animación colocada. Solo puedes tener una.` });
    }

    // Agregar el objeto al inventario del usuario
    usuarios[remoteJid].objetos.push(objeto);

    // Guardar el estado actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};
