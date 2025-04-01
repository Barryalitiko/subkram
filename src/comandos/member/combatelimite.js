const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "atenas",
  description: "Adquiere Atenas para aumentar la cantidad máxima de corazones en 10 puntos.",
  commands: ["atenas"],
  usage: `${PREFIX}atenas`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    let usuario = webMessage.key.participant;

    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};

    // Verificar si el jugador tiene estadísticas
    if (!jugadores[usuario]) {
      return sendReply("⚠️ No se encontraron estadísticas para este jugador. Puede que no haya jugado una pelea aún.");
    }

    // Aumentar la cantidad máxima de corazones en 10 puntos
    jugadores[usuario].maxCorazones = (jugadores[usuario].maxCorazones || 100) + 10; // Aumentar maxCorazones en 10

    // Guardar las estadísticas actualizadas
    fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));

    // Responder al jugador
    await sendReply(`🎉 ¡Has adquirido Atenas! Tu cantidad máxima de corazones ha aumentado en 10 puntos. Ahora tienes ${jugadores[usuario].maxCorazones} corazones máximos.`);
  },
};
