const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "anillo-poseidon",
  description: "Adquiere el Anillo de Poseidón para aumentar la vida del jugador.",
  commands: ["anillo-poseidon", "anillo"],
  usage: `${PREFIX}anillo-poseidon`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    let usuario = webMessage.key.participant;

    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};

    // Verificar si el jugador tiene estadísticas
    if (!jugadores[usuario]) {
      return sendReply("⚠️ No se encontraron estadísticas para este jugador. Puede que no haya jugado una pelea aún.");
    }

    // Aumentar la vida del jugador en 25 puntos con el Anillo de Poseidón
    jugadores[usuario].HP = jugadores[usuario].HP + 25;
    if (jugadores[usuario].HP > 110) jugadores[usuario].HP = 110; // Limitar la vida máxima a 110

    // Guardar las estadísticas actualizadas
    fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));

    // Responder al jugador
    await sendReply(`🎉 ¡Has adquirido el Anillo de Poseidón! Tu vida ha aumentado en 25 puntos. Ahora tienes ${jugadores[usuario].HP} puntos de vida.`);
  },
};
