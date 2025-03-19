const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const usuariosPath = path.resolve(__dirname, "usuarios.json");
let usuarios = {};

if (fs.existsSync(usuariosPath)) {
  usuarios = JSON.parse(fs.readFileSync(usuariosPath, "utf-8"));
}

module.exports = {
  name: "comprarobjeto",
  description: "Compra un objeto para tu rostro.",
  commands: ["comprarobjeto"],
  usage: `${PREFIX}comprarobjeto <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!usuarios[remoteJid] || !usuarios[remoteJid].rostro) {
      return socket.sendMessage(remoteJid, { text: "No tienes un rostro. Compra uno primero." });
    }

    const objeto = args[0]?.toLowerCase();
    if (!objeto) {
      return socket.sendMessage(remoteJid, { text: "Especifica el objeto que deseas comprar (ej: gafas)." });
    }

    if (!usuarios[remoteJid].objetos.includes(objeto)) {
      usuarios[remoteJid].objetos.push(objeto);
      fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
      return socket.sendMessage(remoteJid, { text: `¡Has comprado un objeto: ${objeto}!` });
    } else {
      return socket.sendMessage(remoteJid, { text: `Ya tienes ese objeto.` });
    }
  },
};