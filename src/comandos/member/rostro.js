const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const usuariosPath = path.resolve(__dirname, "usuarios.json");
let usuarios = {};

if (fs.existsSync(usuariosPath)) {
  usuarios = JSON.parse(fs.readFileSync(usuariosPath, "utf-8"));
}

module.exports = {
  name: "comprarrostro",
  description: "Compra un rostro para el usuario.",
  commands: ["comprarrostro"],
  usage: `${PREFIX}comprarrostro`,
  handle: async ({ socket, remoteJid }) => {
    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { rostro: false, objetos: [] };
    }

    if (!usuarios[remoteJid].rostro) {
      usuarios[remoteJid].rostro = true;
      fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
      await socket.sendMessage(remoteJid, { text: "¡Rostro comprado exitosamente!" });
    } else {
      await socket.sendMessage(remoteJid, { text: "Ya tienes un rostro." });
    }
  },
};