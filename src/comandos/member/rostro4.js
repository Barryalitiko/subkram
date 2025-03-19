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
    const objetosDisponibles = ["gafas", "lentes", "ojos", "naruto"];

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

    // Lógica para colocar objetos
    if (objeto === "gafas" || objeto === "lentes") {
      // Verificar si ya tiene algún objeto de tipo A (ojos o naruto) y permitirlo
      if (usuarios[remoteJid].objetos.includes("ojos") || usuarios[remoteJid].objetos.includes("naruto")) {
        return socket.sendMessage(remoteJid, { text: `Ya tienes ojos o naruto colocados. Los objetos A1 (gafas, lentes) van por encima de los ojos. Usa #quitar ojos o #quitar naruto para poner otro objeto.` });
      }

      // Colocar el objeto A1 (gafas/lentes)
      usuarios[remoteJid].objetos.push(objeto);
    } else if (objeto === "ojos" || objeto === "naruto") {
      // Permitir colocar un objeto A (ojos o naruto) sin necesidad de un objeto A1
      if (!usuarios[remoteJid].objetos.includes("gafas") && !usuarios[remoteJid].objetos.includes("lentes")) {
        // Colocar el objeto A (ojos o naruto)
        usuarios[remoteJid].objetos.push(objeto);
      } else {
        return socket.sendMessage(remoteJid, { text: `No puedes colocar ojos o naruto si ya tienes un objeto A1 (gafas o lentes) colocado. Usa #quitar gafas o #quitar lentes para poner otros objetos.` });
      }
    }

    // Guardar el estado actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};