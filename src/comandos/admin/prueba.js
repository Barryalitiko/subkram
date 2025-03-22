const { PREFIX } = require("../../krampus");

module.exports = {
  name: "unknownCommand",
  description: "Maneja comandos inexistentes",
  commands: ["*"], // Captura cualquier comando no definido
  handle: async ({ sendReply, commandName }) => {
    await sendReply(`❌ *El comando "${PREFIX}${commandName}" no existe.*\n\nUsa *${PREFIX}help* para ver la lista de comandos disponibles.`);
  },
};
