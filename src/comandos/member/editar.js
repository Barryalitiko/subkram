
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editmsg",
  description: "Envía un mensaje y lo edita después",
  commands: ["editmsg"],
  usage: `${PREFIX}editmsg`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    // Enviar el mensaje inicial
    let sentMessage = await sendReply("⏳ Procesando...");

    // Esperar unos segundos antes de editarlo
    setTimeout(async () => {
      try {
        await socket.sendMessage(remoteJid, {
          edit: sentMessage.key, // Editar el mensaje anterior
          text: "✅ Mensaje actualizado con éxito!",
        });
      } catch (error) {
        console.error("Error al editar el mensaje:", error);
      }
    }, 3000); // 3 segundos antes de editarlo
  },
};
