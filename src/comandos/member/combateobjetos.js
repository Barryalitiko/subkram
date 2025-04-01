const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "pociones",
  description: "Adquiere pociones para recuperar vida.",
  commands: ["pociones"],
  usage: `${PREFIX}pociones`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    let usuario = webMessage.key.participant;

    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};

    // Verificar si el jugador tiene estadísticas
    if (!jugadores[usuario]) {
      return sendReply("⚠️ No se encontraron estadísticas para este jugador. Puede que no haya jugado una pelea aún.");
    }

    // Verificar si el jugador está al máximo de vida
    if (jugadores[usuario].HP >= 110) {
      return sendReply("⚠️ ¡Ya estás al máximo de vida! No puedes adquirir más pociones.");
    }

    // Lista de pociones disponibles
    const pociones = [
      { nombre: "Poción Pequeña", vida: 10 },
      { nombre: "Poción Media", vida: 20 },
      { nombre: "Poción Grande", vida: 30 },
      { nombre: "Poción Épica", vida: 50 },
    ];

    let mensaje = "🛒 **Tienda de Pociones** 🛒\n\n";
    pociones.forEach((pocion, index) => {
      mensaje += `${index + 1}. ${pocion.nombre} - Recupera ${pocion.vida} de vida\n`;
    });

    // Mostrar tienda de pociones
    let tiendaMessage = await sendReply(mensaje);

    // Esperar la respuesta del jugador para seleccionar una poción
    socket.on("chat-update", async (message) => {
      if (message.key.remoteJid === remoteJid) {
        const seleccion = parseInt(message.message.conversation);
        
        // Verificar que la selección es válida
        if (isNaN(seleccion) || seleccion < 1 || seleccion > pociones.length) {
          return await socket.sendMessage(remoteJid, { text: "⚠️ Selección inválida. Por favor, elige una opción de la tienda." });
        }

        const pocionSeleccionada = pociones[seleccion - 1];
        let nuevaVida = jugadores[usuario].HP + pocionSeleccionada.vida;

        // Si la vida supera el máximo, limitarla a 110
        if (nuevaVida > 110) nuevaVida = 110;

        // Actualizar la vida del jugador
        jugadores[usuario].HP = nuevaVida;

        // Guardar las estadísticas actualizadas
        fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));

        // Enviar animación y mensaje de adquisición
        await socket.sendMessage(remoteJid, { text: `✨ *¡Has adquirido la ${pocionSeleccionada.nombre}!*\nRecuperaste ${pocionSeleccionada.vida} puntos de vida.\n\nAhora tienes ${jugadores[usuario].HP} puntos de vida.` });

        // Eliminar el mensaje de tienda
        await socket.sendMessage(remoteJid, { text: "¡Gracias por tu compra!" });
      }
    });
  },
};
