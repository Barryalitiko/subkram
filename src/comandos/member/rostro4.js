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
    // Verificar si el archivo JSON existe
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
    }

    let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
    }

    // Si el usuario no especifica un objeto, mostrar los objetos que ha comprado
    if (!args[0]) {
      const objetosUsuario = usuarios[remoteJid].objetos;
      if (objetosUsuario.length === 0) {
        return socket.sendMessage(remoteJid, { text: "No tienes objetos comprados." });
      }
      return socket.sendMessage(remoteJid, { text: `📜 *Tus objetos comprados:*\n${objetosUsuario.join(" | ")}` });
    }

    const objeto = args[0].toLowerCase();

    // Objetos disponibles por categorías
    const objetosA = ["ojos", "naruto", "sasuke", "rinesharingan", "rinegan", "remolino"];
    const objetosA1 = ["gafas", "lentes"];
    const objetosB = ["labios", "bocamorada", "bocaroja", "bocaalegre", "labiosnormales"];
    const objetosZ = ["tortuga", "love", "buho", "poderosas", "rosada", "torpe", "kawai", "huesos", "zombie", "sakura", "minato", "popi", "mariposa"];

    const objetosDisponibles = [...objetosA, ...objetosA1, ...objetosB, ...objetosZ];

    if (!objetosDisponibles.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: "Ese objeto no está disponible para colocar." });
    }

    // Verificar si el usuario tiene el objeto en su inventario
    if (!usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `No tienes ${objeto}. Usa #comprarobjeto ${objeto} para obtenerlo.` });
    }

    const verificarCapa = (grupo) => usuarios[remoteJid].objetos.find(o => grupo.includes(o));

    // Comprobar si ya tiene un objeto de la misma capa
    let objetoActual = null;
    if ((objetoActual = verificarCapa(objetosA)) && objetosA.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes colocado ${objetoActual}. Usa #quitar ${objetoActual} para poder colocarte ${objeto}.` });
    }
    if ((objetoActual = verificarCapa(objetosA1)) && objetosA1.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes colocado ${objetoActual}. Usa #quitar ${objetoActual} para poder colocarte ${objeto}.` });
    }
    if ((objetoActual = verificarCapa(objetosB)) && objetosB.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes colocado ${objetoActual}. Usa #quitar ${objetoActual} para poder colocarte ${objeto}.` });
    }
    if ((objetoActual = verificarCapa(objetosZ)) && objetosZ.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes colocado ${objetoActual}. Usa #quitar ${objetoActual} para poder colocarte ${objeto}.` });
    }

    // Agregar el objeto al inventario del usuario
    usuarios[remoteJid].objetos.push(objeto);

    // Guardar el estado actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};
