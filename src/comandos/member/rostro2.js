const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../../usuarios.json");

module.exports = {
  name: "comprarobjeto",
  description: "Compra un objeto y lo añade a tu inventario, o muestra la lista de objetos disponibles.",
  commands: ["objeto", "comprarobjeto"],
  usage: `${PREFIX}comprarobjeto <objeto> | ${PREFIX}objeto`,
  handle: async ({ socket, remoteJid, args }) => {
    // Lista de objetos disponibles por categorías
    const objetosA = ["ojos", "naruto", "sasuke", "rinesharingan", "rinegan", "remolino"]; // Grupo A (ojos)
    const objetosA1 = ["gafas", "lentes"]; // Grupo A1 (gafas/lentes)
    const objetosB = ["labios", "bocamorada", "bocaroja", "bocaalegre", "labiosnormales"]; // Grupo B (bocas)

    const objetosDisponibles = [...objetosA, ...objetosA1, ...objetosB];

    // Si el usuario solo usa "#objeto", mostrar la lista completa de objetos
    if (!args[0]) {
      return socket.sendMessage(remoteJid, {
        text: `📜 *Lista de objetos disponibles:*  
        
👁️ *Grupo A (ojos)*: ${objetosA.join(", ")}  
🕶️ *Grupo A1 (gafas/lentes)*: ${objetosA1.join(", ")}  
👄 *Grupo B (bocas)*: ${objetosB.join(", ")}  

Usa *#comprarobjeto <objeto>* para comprar un objeto.`,
      });
    }

    const objeto = args[0].toLowerCase();

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