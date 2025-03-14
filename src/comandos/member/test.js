const { PREFIX } = require("../../krampus");

module.exports = {
  name: "editTest",
  description: "Enviar un mensaje y editarlo después de 2 segundos",
  commands: ["edittest"],
  usage: `${PREFIX}edittest`,
  handle: async ({ sendReply, sendReact }) => {
    const startMessage = await sendReply("Hola");
    
    // Reaccionamos al mensaje
    await sendReact("👻");
    
    // Esperar 2 segundos y editar el mensaje
    setTimeout(async () => {
      await sendReply("Adiós", { edit: startMessage.key.id });
    }, 2000);
  },
};