const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../../usuarios.json");

module.exports = {
  name: "comprarobjeto",
  description: "Compra un objeto y lo añade a tu inventario.",
  commands: ["comprarobjeto"],
  usage: `${PREFIX}comprarobjeto <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!args[0]) {
      return socket.sendMessage(remoteJid, { text: "Debes especificar qué objeto quieres comprar." });
    }

    const objeto = args[0].toLowerCase();

    // Lista actualizada con los objetos de los grupos A y B
    const objetosA = ["ojos", "naruto", "sasuke", "rinesharingan", "rinegan", "remolino"]; // Grupo A
    const objetosA1 = ["gafas", "lentes"]; // Grupo A1
    const objetosB = ["labios", "bocamorada", "bocaroja", "bocaalegre", "labiosnormales"]; // Grupo B

    const objetosDisponibles = [...objetosA, ...objetosA1, ...objetosB];

    if (!objetosDisponibles.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: "Ese objeto no está disponible para comprar." });
    }

    // Verificar si el archivo JSON existe, si no, crearlo
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
    }

    let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    // Verificar si el usuario ya tiene el objeto
    if (usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes ${objeto}. Solo puedes tener uno de cada objeto.` });
    }

    // Si el usuario no tiene el objeto, lo añade
    usuarios[remoteJid].objetos.push(objeto);
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha comprado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `¡Has comprado ${objeto}! Usa #colocar ${objeto} para ponértelo.` });
  },
};