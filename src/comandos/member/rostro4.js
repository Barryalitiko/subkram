const { PREFIX } = require("../../krampus"); // Aseguramos que el PREFIX esté definido
const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../../usuarios.json");

module.exports = {
  name: "colocar",
  description: "Coloca un objeto en tu personaje.",
  commands: ["colocar"],
  usage: `${PREFIX}colocar <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
    }

    let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    // Si no se especifica objeto, mostrar la lista de objetos
    if (!args[0]) {
      const objetos = usuarios[remoteJid].objetos;
      if (objetos.length === 0) {
        return socket.sendMessage(remoteJid, { text: "No tienes objetos. Usa #comprarobjeto <objeto> para adquirir uno." });
      }
      return socket.sendMessage(remoteJid, { text: `Tienes los siguientes objetos:\n${objetos.join("\n")}` });
    }

    const objeto = args[0].toLowerCase();
    const objetosDisponibles = ["gafas", "lentes", "ojos"]; // Incluir los objetos disponibles

    // Verificar si el objeto solicitado está disponible
    if (!objetosDisponibles.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `El objeto ${objeto} no es válido. Solo puedes colocar gafas, lentes u ojos.` });
    }

    if (!usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `No tienes ${objeto}. Usa #comprarobjeto ${objeto} para obtenerlo.` });
    }

    // Si ya tiene un objeto colocado, quitarlo
    if (objeto === "gafas" || objeto === "lentes" || objeto === "ojos") {
      // Se eliminan objetos tipo A antes de colocar uno nuevo
      usuarios[remoteJid].objetos = usuarios[remoteJid].objetos.filter((o) => o !== "gafas" && o !== "lentes" && o !== "ojos");
    }

    // Colocar el objeto seleccionado
    usuarios[remoteJid].objetos.push(objeto);

    // Guardar los cambios
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Te has puesto ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};