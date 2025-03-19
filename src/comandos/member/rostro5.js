const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../../usuarios.json");

module.exports = {
  name: "quitar",
  description: "Quita un objeto de tu personaje.",
  commands: ["quitar"],
  usage: `${PREFIX}quitar <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!args[0]) {
      return socket.sendMessage(remoteJid, { text: "Debes especificar qué objeto quieres quitar." });
    }

    const objeto = args[0].toLowerCase();

    // Verificar si el archivo JSON existe
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
    }

    let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!usuarios[remoteJid] || !usuarios[remoteJid].objetos.includes(objeto)) {
      return socket.sendMessage(remoteJid, { text: `No tienes ${objeto} colocado.` });
    }

    // Eliminar el objeto del inventario
    usuarios[remoteJid].objetos = usuarios[remoteJid].objetos.filter((o) => o !== objeto);
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");

    console.log(`✅ [DEBUG] ${remoteJid} ha quitado:`, objeto);

    // Respuesta de confirmación
    await socket.sendMessage(remoteJid, { text: `Te has quitado ${objeto}.` });
  },
};