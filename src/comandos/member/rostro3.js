const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const usuariosPath = path.resolve(__dirname, "usuarios.json");
let usuarios = {};

if (fs.existsSync(usuariosPath)) {
  usuarios = JSON.parse(fs.readFileSync(usuariosPath, "utf-8"));
}

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos comprados.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    if (!usuarios[remoteJid] || !usuarios[remoteJid].rostro) {
      return socket.sendMessage(remoteJid, { text: "No tienes un rostro." });
    }

    const imagenBasePath = path.resolve(__dirname, "../../../assets/images/cara.png"); // Ruta base del rostro
    let imagen = imagenBasePath;

    // Verificar si el usuario tiene objetos comprados
    if (usuarios[remoteJid].objetos.includes("gafas")) {
      imagen = path.resolve(__dirname, "../../../assets/images/cara_con_gafas.png"); // Imagen con gafas
    }

    await socket.sendMessage(remoteJid, { image: { url: imagen }, caption: "Aquí está tu rostro." });
  },
};