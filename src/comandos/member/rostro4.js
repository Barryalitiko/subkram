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
    const objetosDisponibles = ["gafas", "lentes", "ojos"];

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

    // Lógica para colocar objetos, considerando el orden de tipo A1 y A
    if (objeto === "gafas" || objeto === "lentes") {
      // Verificar si ya tiene algún objeto de tipo A (ojos) y evitar colocarlos
      if (usuarios[remoteJid].objetos.includes("ojos")) {
        return socket.sendMessage(remoteJid, { text: `Ya tienes ojos colocados. Los objetos A1 (gafas, lentes) van por encima de los ojos. Usa #quitar ojos para poner otro objeto.` });
      }

      // Colocar el objeto A1 (gafas/lentes)
      usuarios[remoteJid].objetos.push(objeto);
    } else if (objeto === "ojos") {
      // Verificar si ya tiene algún objeto A1 (gafas/lentes) y permitir colocar ojos debajo
      if (usuarios[remoteJid].objetos.includes("gafas") || usuarios[remoteJid].objetos.includes("lentes")) {
        // Colocar el objeto A (ojos)
        usuarios[remoteJid].objetos.push(objeto);
      } else {
        return socket.sendMessage(remoteJid, { text: `No puedes colocar ojos sin gafas o lentes. Los ojos (A) deben ir debajo de un objeto A1 (gafas o lentes).` });
      }
    }

    // Guardar el estado actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};