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
    const objetosA = ["ojos", "naruto", "sasuke", "rinesharingan", "rinegan", "remolino"];
    const objetosA1 = ["gafas", "lentes"];
    const objetosB = ["labios", "bocamorada", "bocaroja", "bocaalegre", "labiosnormales"];
    const objetosZ = ["tortuga", "love", "buho", "poderosas", "rosada", "torpe", "kawai", "huesos", "zombie", "sakura", "minato", "popi", "mariposa"];

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

    // Función para encontrar si el usuario ya tiene un objeto de la misma categoría
    const encontrarObjetoEnUso = (categoria) => usuarios[remoteJid].objetos.find(o => categoria.includes(o));

    let objetoEnUso = null;

    if (objetosA.includes(objeto)) objetoEnUso = encontrarObjetoEnUso(objetosA);
    else if (objetosA1.includes(objeto)) objetoEnUso = encontrarObjetoEnUso(objetosA1);
    else if (objetosB.includes(objeto)) objetoEnUso = encontrarObjetoEnUso(objetosB);
    else if (objetosZ.includes(objeto)) objetoEnUso = encontrarObjetoEnUso(objetosZ);

    if (objetoEnUso) {
      return socket.sendMessage(remoteJid, { text: `Ya tienes colocado *${objetoEnUso}*. Usa *#quitar ${objetoEnUso}* para poder colocarte *${objeto}*.` });
    }

    // Agregar el objeto al inventario del usuario
    usuarios[remoteJid].objetos.push(objeto);

    // Guardar el estado actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha colocado:`, usuarios[remoteJid].objetos);

    await socket.sendMessage(remoteJid, { text: `Has colocado ${objeto}. Usa #quitar ${objeto} para quitártelo.` });
  },
};
