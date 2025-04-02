const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "tienda-pociones",
  description: "Abre la tienda de pociones para recuperar vida.",
  commands: ["pociones"],
  usage: `${PREFIX}pociones`,
  handle: async ({ sendReply, socket, remoteJid, webMessage, args }) => {
    let usuario = webMessage.key.participant;
    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};

    if (!jugadores[usuario]) {
      return sendReply("⚠️ No se encontraron estadísticas para este jugador. Puede que no haya jugado una pelea aún.");
    }

    const pociones = {
      "10": 10,
      "20": 20,
      "30": 30,
      "40": 40,
      "50": 50
    };

    if (!args[0]) {
      let tienda = "🛒 *Tienda de Pociones* 🛒\n";
      for (let [nombre, valor] of Object.entries(pociones)) {
        tienda += `💊 Poción de ${nombre} HP ➝ *${PREFIX}pociones ${nombre}*\n`;
      }
      return sendReply(tienda);
    }

    let seleccion = args[0];
    if (!pociones[seleccion]) {
      return sendReply("❌ Opción inválida. Usa el comando sin argumentos para ver la lista de pociones disponibles.");
    }

    let cantidad = pociones[seleccion];
    let vidaMaxima = jugadores[usuario].vidaMaxima || 110;
    if (jugadores[usuario].HP >= vidaMaxima) {
      return sendReply("⚠️ Ya tienes tu vida al máximo. No puedes usar una poción ahora.");
    }

    jugadores[usuario].HP = Math.min(vidaMaxima, jugadores[usuario].HP + cantidad);
    fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));

    let animacion = `💊 Usando poción de ${cantidad} HP...`;
    let mensaje = `✨ Tu vida ha aumentado en ${cantidad} puntos. Ahora tienes ${jugadores[usuario].HP} HP.`;
    await sendReply(animacion);
    setTimeout(() => sendReply(mensaje), 2000);
  },
};
