const { PREFIX } = require("../../krampus"); // Para acceder al prefix

// Variable global para almacenar las personas que se han unido
let joinedUsers = {};

// Función para resetear la lista a las 12 PM
function resetJoinedUsers() {
  console.log("[RESET] Reseteando lista de usuarios que se unieron.");
  joinedUsers = {};
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
  const msUntilNextReset = nextReset - now;
  setTimeout(resetJoinedUsers, msUntilNextReset);
}

// Iniciar el primer reseteo
resetJoinedUsers();

module.exports = {
  name: "usuarios-unidos",
  description: "Muestra una lista de las personas que se unieron al grupo hoy.",
  commands: ["usuarios-unidos", "joined"],
  usage: `${PREFIX}usuarios-unidos`,
  cooldown: 10, // 10 segundos de cooldown
  handle: async ({ socket, sendReply, sendReact, remoteJid }) => {
    try {
      await sendReact("⏳"); // Emoji de espera

      if (!joinedUsers[remoteJid] || joinedUsers[remoteJid].length === 0) {
        await sendReply("Hoy no se ha unido nadie al grupo.");
        console.log(`[USUARIOS-UNIDOS] No hay usuarios registrados en ${remoteJid}.`);
        return;
      }

      // Construir la respuesta con los usuarios unidos
      let response = `👥 *Usuarios que se unieron hoy:* 👥\n\n`;
      joinedUsers[remoteJid].forEach((user, index) => {
        response += `${index + 1}. ${user}\n`;
      });

      await sendReply(response);
      await sendReact("✅"); // Emoji de éxito
      console.log(`[USUARIOS-UNIDOS] Enviando lista de usuarios unidos en ${remoteJid}.`);
    } catch (error) {
      console.error("[USUARIOS-UNIDOS] Error al ejecutar el comando:", error);
      await sendReply("Hubo un error al intentar obtener la lista de usuarios unidos.");
      await sendReact("❌"); // Emoji de error
    }
  },

  // Evento para detectar cuando alguien se une al grupo
  onGroupParticipantsUpdate: async ({ socket, remoteJid, participants }) => {
    try {
      for (const participant of participants) {
        if (!joinedUsers[remoteJid]) {
          joinedUsers[remoteJid] = [];
        }

        if (!joinedUsers[remoteJid].includes(participant)) {
          joinedUsers[remoteJid].push(participant);
          console.log(`[USUARIOS-UNIDOS] ${participant} se unió al grupo ${remoteJid}.`);
        }
      }
    } catch (error) {
      console.error("[USUARIOS-UNIDOS] Error al registrar participantes:", error);
    }
  },
};