const { PREFIX } = require("../../krampus");

module.exports = {
  name: "responderEstado",
  description: "Simula una respuesta a un estado de WhatsApp.",
  commands: ["responderestado"],
  usage: `${PREFIX}responderestado`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      const estadoJid = "status@broadcast"; // 📌 WhatsApp usa este JID para los estados

      const mensaje = {
        text: "👋 Hola, este es un mensaje de prueba en respuesta a un estado.",
        contextInfo: {
          quotedMessage: {
            conversation: "🌟 Estado original de prueba",
          },
          participant: "status@broadcast",
        },
      };

      await socket.sendMessage(estadoJid, mensaje);
      sendReply("✅ Se ha enviado la respuesta al estado.");

    } catch (error) {
      console.error("❌ Error al responder al estado:", error);
      sendReply("⚠️ Hubo un problema al intentar responder al estado.");
    }
  },
};