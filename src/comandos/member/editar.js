const { PREFIX } = require("../../krampus");

module.exports = {
  name: "carrera",
  description: "Simula una carrera de caballos",
  commands: ["carrera"],
  usage: `${PREFIX}carrera`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    // Lista de caballos
    const caballos = ["🏇", "🐎", "🐴", "🦄"];
    let posiciones = [0, 0, 0, 0];

    // Enviar mensaje inicial
    let sentMessage = await sendReply("🏁 ¡Comienza la carrera!\n\n" + mostrarCarrera(posiciones, caballos));

    let intervalo = setInterval(async () => {
      // Avanzar aleatoriamente cada caballo
      posiciones = posiciones.map(pos => pos + Math.floor(Math.random() * 3));

      // Editar mensaje con la nueva posición
      try {
        await socket.sendMessage(remoteJid, {
          edit: sentMessage.key,
          text: `🏁 ¡Carrera en progreso!\n\n${mostrarCarrera(posiciones, caballos)}`,
        });

        // Si un caballo llega a la meta (20 posiciones), terminar la carrera
        if (Math.max(...posiciones) >= 20) {
          clearInterval(intervalo);
          let ganador = caballos[posiciones.indexOf(Math.max(...posiciones))];

          setTimeout(async () => {
            await socket.sendMessage(remoteJid, {
              edit: sentMessage.key,
              text: `🎉 ¡La carrera terminó! El ganador es ${ganador} 🏆`,
            });
          }, 2000);
        }
      } catch (error) {
        console.error("Error al editar el mensaje:", error);
        clearInterval(intervalo);
      }
    }, 2000);
  },
};

// Función para mostrar la carrera en forma de texto
function mostrarCarrera(posiciones, caballos) {
  return posiciones
    .map((pos, i) => `${caballos[i]} ${"-".repeat(pos)}🏁`)
    .join("\n");
}

