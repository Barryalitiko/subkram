const { PREFIX } = require("../../krampus");
const { setWelcomeMode, getWelcomeMode } = require("../../utils/database"); // Para manejar la configuración

module.exports = {
  name: "bienvenida",
  description: "Configura el modo de bienvenida para el grupo.",
  commands: ["bienvenida", "welcome"],
  usage: `${PREFIX}bienvenida [modo]`,
  handle: async ({ args, sendReply, socket, remoteJid }) => {
    // Verificar el argumento proporcionado
    const mode = args[0];

    if (!mode || !["0", "1", "2"].includes(mode)) {
      return sendReply(`Por favor, usa uno de los siguientes modos:\n1. ${PREFIX}bienvenida 0 (Desactiva la bienvenida)\n2. ${PREFIX}bienvenida 1 (Etiqueta al usuario con mensaje de bienvenida)\n3. ${PREFIX}bienvenida 2 (Envía la foto de perfil junto a mensaje de bienvenida)`);
    }

    try {
      // Guardar la configuración
      await setWelcomeMode(remoteJid, mode);
      let responseMessage;

      if (mode === "0") {
        responseMessage = "La bienvenida ha sido desactivada para este grupo.";
      } else if (mode === "1") {
        responseMessage = "La bienvenida por etiqueta ha sido activada para este grupo.";
      } else if (mode === "2") {
        responseMessage = "La bienvenida con foto de perfil ha sido activada para este grupo.";
      }

      await sendReply(responseMessage);
    } catch (error) {
      console.error("Error al configurar la bienvenida: ", error);
      await sendReply("❌ Hubo un problema al configurar la bienvenida.");
    }
  },
};