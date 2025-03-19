const { PREFIX } = require("../../krampus");

let usuarios = {}; // Para almacenar los datos de cada usuario (esto sería una base de datos en un caso real)

module.exports = {
  name: "colocar",
  description: "Coloca un objeto (gafas) sobre el rostro.",
  commands: ["colocar"],
  usage: `${PREFIX}colocar <objeto>`,
  handle: async ({ socket, remoteJid, args }) => {
    if (!usuarios[remoteJid] || !usuarios[remoteJid].rostro) {
      return socket.sendMessage(remoteJid, { text: "No tienes un rostro para colocar objetos." });
    }
    
    const objeto = args.join(" ");
    if (objeto === "gafas") {
      if (!usuarios[remoteJid].objetos.includes("gafas")) {
        return socket.sendMessage(remoteJid, { text: "No tienes gafas para colocar." });
      }
      // Aquí podríamos hacer la lógica de colocar las gafas sobre la imagen del rostro
      await socket.sendMessage(remoteJid, { text: "Gafas colocadas sobre tu rostro." });
    } else {
      await socket.sendMessage(remoteJid, { text: "Objeto no reconocido." });
    }
  },
};