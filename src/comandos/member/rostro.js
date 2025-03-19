const { PREFIX } = require("../../krampus");

let usuarios = {}; // Para almacenar los datos de cada usuario (esto sería una base de datos en un caso real)

module.exports = {
  name: "comprarrostro",
  description: "Compra un rostro para el usuario.",
  commands: ["comprarrostro"],
  usage: `${PREFIX}comprarrostro`,
  handle: async ({ socket, remoteJid }) => {
    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { rostro: false, objetos: [] }; // Inicializa datos para el usuario
    }

    if (!usuarios[remoteJid].rostro) {
      usuarios[remoteJid].rostro = true; // El usuario ahora tiene rostro
      await socket.sendMessage(remoteJid, { text: "¡Rostro comprado exitosamente!" });
    } else {
      await socket.sendMessage(remoteJid, { text: "Ya tienes un rostro." });
    }
  },
};