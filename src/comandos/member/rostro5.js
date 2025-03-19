const { PREFIX } = require("../../krampus");

let usuarios = {}; // Para almacenar los datos de cada usuario (esto sería una base de datos en un caso real)

module.exports = {
  name: "quitar",
  description: "Quita un objeto (gafas) del rostro.",
  commands: ["quitar"],
  usage: `${PREFIX}quitar <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!usuarios[remoteJid] || !usuarios[remoteJid].rostro) {
      return socket.sendMessage(remoteJid, { text: "No tienes un rostro para quitar objetos." });
    }
    
    const objeto = args.join(" ");
    if (objeto === "gafas") {
      if (!usuarios[remoteJid].objetos.includes("gafas")) {
        return socket.sendMessage(remoteJid, { text: "No tienes gafas para quitar." });
      }
      // Aquí podríamos hacer la lógica de quitar las gafas de la imagen
      usuarios[remoteJid].objetos = usuarios[remoteJid].objetos.filter(item => item !== "gafas");
      await socket.sendMessage(remoteJid, { text: "Gafas quitadas de tu rostro." });
    } else {
      await socket.sendMessage(remoteJid, { text: "Objeto no reconocido." });
    }
  },
};