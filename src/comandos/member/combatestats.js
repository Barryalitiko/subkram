const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "estadisticas",
  description: "Muestra las estadísticas del jugador",
  commands: ["estadisticas", "stats"],
  usage: `${PREFIX}estadisticas`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    let usuario = webMessage.key.participant;

    const razasPath = path.resolve(process.cwd(), "assets/razas.json");
    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");
    let razas = JSON.parse(fs.readFileSync(razasPath, "utf8"));
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};

    const obtenerEstadisticas = (usuario) => {
      if (!jugadores[usuario]) {
        return "⚠️ No se encontraron estadísticas para este jugador. Puede que no haya jugado una pelea aún.";
      }
      
      let jugador = jugadores[usuario];
      let raza = jugador.raza;
      let stats = `
      **Estadísticas de @${usuario.split("@")[0]}**
      🏷️ *Raza*: ${raza}
      💥 *HP*: ${jugador.HP} / ${razas[raza].HP}
      ⚡ *MP*: ${jugador.MP} / 100
      ✨ *Ataque Mágico (AM)*: ${jugador.AM} / 100
      🛡️ *Escudo*: ${jugador.escudo}
      💨 *Esquivar*: ${jugador.esquivar * 100}% 
      🏃‍♂️ *Velocidad*: ${jugador.velocidad}
      `;
      return stats;
    };

    let statsMessage = obtenerEstadisticas(usuario);

    await sendReply(statsMessage);
  },
};
