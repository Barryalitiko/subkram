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
    const objetosA = ["👁️ Ojos", "🌀 Naruto", "🔥 Sasuke", "🔱 RinneSharingan", "🔵 Rinnegan", "🌪️ Remolino"];
    const objetosA1 = ["🕶️ Gafas", "👓 Lentes"];
    const objetosB = ["💋 Labios", "💜 Boca Morada", "❤️ Boca Roja", "😁 Boca Alegre", "👄 Labios Normales"];
    const objetosZ = ["🐢 Tortuga"]; // Nuevo objeto agregado

    const objetosDisponibles = [...objetosA, ...objetosA1, ...objetosB, ...objetosZ];

    // Si el usuario solo usa "#objeto", mostrar la lista completa de objetos en un formato atractivo
    if (!args[0]) {
      return socket.sendMessage(remoteJid, {
        text: `🎭 *OBJETOS DISPONIBLES* 🎭
━━━━━━━━━━━━━━━━━━
👁️ *Grupo A (ojos)*  
${objetosA.join(" | ")}
━━━━━━━━━━━━━━━━━━
🕶️ *Grupo A1 (gafas/lentes)*  
${objetosA1.join(" | ")}
━━━━━━━━━━━━━━━━━━
👄 *Grupo B (bocas)*  
${objetosB.join(" | ")}
━━━━━━━━━━━━━━━━━━
🐢 *Grupo Z (animaciones)*  
${objetosZ.join(" | ")}
━━━━━━━━━━━━━━━━━━
🛍️ *Para comprar un objeto, usa:*  
*#comprarobjeto <objeto>*  
Ejemplo: *#comprarobjeto gafas*`,
      });
    }

    const objeto = args[0].toLowerCase();

    // Normalizar los nombres de los objetos sin emojis y en minúsculas
    const normalizar = (nombre) => nombre.replace(/[^a-z]/gi, "").toLowerCase();

    // Convertir la lista de objetos en una versión sin emojis para comparar
    const objetosNormalizados = objetosDisponibles.map(normalizar);

    if (!objetosNormalizados.includes(objeto)) {
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

    await socket.sendMessage(remoteJid, { text: `¡Has comprado *${objeto}*! Usa *#colocar ${objeto}* para ponértelo.` });
  },
};
