const { PREFIX } = require("../../krampus"); // Para acceder al prefix
let leftUsers = []; // Almacenará los usuarios que se hayan salido

module.exports = {
  name: "usuarios-que-salieron",
  description: "Lista de usuarios que se han salido del grupo hoy.",
  commands: ["salidos", "usuarios-salidos"],
  usage: `${PREFIX}salidos`,
  cooldown: 10, // 10 segundos entre cada uso
  handle: async ({ sendReply, sendReact }) => {
    try {
      await sendReact("⏳"); // Emoji de espera

      if (!leftUsers.length) {
        await sendReply("Hoy no se ha salido nadie del grupo.");
        await sendReact("✅");
        return;
      }

      let response = `👥 *Usuarios que se han salido hoy:* 👥\n\n`;
      leftUsers.forEach((user, index) => {
        response += `${index + 1}. ${user}\n`;
      });

      await sendReply(response);
      await sendReact("✅"); // Emoji de éxito
    } catch (error) {
      console.error("[SALIDOS] Error al procesar la lista de usuarios:", error);
      await sendReply("Hubo un error al intentar obtener la lista de usuarios que se salieron.");
      await sendReact("❌"); // Emoji de error
    }
  },
};

// Función para registrar cuando un usuario se salga del grupo
const trackUserLeft = (userJid) => {
  if (!leftUsers.includes(userJid)) {
    leftUsers.push(userJid);
  }
};

// Función para reiniciar la lista cada día a las 12 PM
const resetLeftUsersDaily = () => {
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 12 && now.getMinutes() === 0) {
      leftUsers = [];
      console.log("[SALIDOS] Lista de usuarios que se salieron reiniciada.");
    }
  }, 60000); // Revisa cada minuto si son las 12 PM
};

// Exportar la función para registrar usuarios
module.exports.trackUserLeft = trackUserLeft;
module.exports.resetLeftUsersDaily = resetLeftUsersDaily;