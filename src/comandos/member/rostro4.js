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
    const objetosDisponibles = ["gafas", "lentes", "ojos", "naruto"];  // Añadimos "naruto"

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

    // Lógica para colocar objetos A1 (gafas/lentes)
    if (objeto === "gafas" || objeto === "lentes") {
      // Colocar el objeto A1 (gafas/lentes)
      usuarios[remoteJid].objetos.push(objeto);
    } else if (objeto === "ojos" || objeto === "naruto") {
      // Los objetos A (ojos y naruto) se pueden colocar sin importar si hay un A1 colocado
      usuarios[remoteJid].objetos.push(objeto);
    }

    // Guardar el estado actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};