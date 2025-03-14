const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editTest",
  description: "Envía un mensaje y lo edita después de 2 segundos",
  commands: ["edittest"],
  usage: `${PREFIX}edittest`,
  handle: async ({ sendMessage, sendReact, chatId }) => {
    // Enviar el mensaje inicial "Hola"
    const sentMessage = await sendMessage(chatId, { text: "Hola" });

    // Reaccionar con un emoji
    await sendReact("👻");

    // Esperar 2 segundos y editar el mensaje a "Adiós"
    setTimeout(async () => {
      await sendMessage(chatId, { text: "Adiós" }, { edit: sentMessage.key.id });
    }, 2000);
  },
};