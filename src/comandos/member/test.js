const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editTest",
  description: "Envía un mensaje y lo edita después de 2 segundos",
  commands: ["edittest"],
  usage: `${PREFIX}edittest`,
  handle: async ({ sendMessage, sendReact, chatId }) => {
    try {
      // Enviar el mensaje inicial "Hola"
      const sentMessage = await sendMessage(chatId, { text: "Hola" });

      // Verificamos si el mensaje se envió correctamente
      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error("No se pudo obtener el ID del mensaje enviado.");
      }

      // Reaccionar con un emoji
      await sendReact("👻");

      // Esperar 2 segundos y editar el mensaje a "Adiós"
      setTimeout(async () => {
        try {
          await sendMessage(chatId, { text: "Adiós" }, { edit: sentMessage.key });
        } catch (editError) {
          console.error("Error al editar el mensaje:", editError);
        }
      }, 2000);
    } catch (error) {
      console.error("Error en el comando editTest:", error);
    }
  },
};