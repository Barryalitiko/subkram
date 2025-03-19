const { PREFIX } = require("../../krampus");

let usuarios = {}; // Para almacenar los datos de cada usuario (esto sería una base de datos en un caso real)

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos comprados.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    // Verificamos que el usuario tenga un rostro
    if (!usuarios[remoteJid] || !usuarios[remoteJid].rostro) {
      return socket.sendMessage(remoteJid, { text: "No tienes un rostro." });
    }

    // Imagen base del rostro (se generaría aquí con los objetos)
    let imagen = "ruta_del_rostro.png"; // Aquí iría la imagen del rostro sin objetos

    // Verificamos si el usuario tiene gafas
    if (usuarios[remoteJid].objetos && usuarios[remoteJid].objetos.includes("gafas")) {
      imagen = "ruta_con_gafas.png"; // Aquí iría la imagen del rostro con gafas
    }

    await socket.sendMessage(remoteJid, { image: { url: imagen }, caption: "Aquí está tu rostro." });
  },
};