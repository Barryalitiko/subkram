const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

// Ruta al archivo de estado
const statusFilePath = path.resolve(process.cwd(), "assets/status.json");

// Función para leer el estado del archivo status.json
const readStatus = () => {
  try {
    const data = fs.readFileSync(statusFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer el archivo de estado:", error);
    return { enabled: false }; // En caso de error, consideramos que el sistema está apagado
  }
};

module.exports = {
  name: "kiss",
  description: "Enviar un beso a alguien.",
  commands: ["kiss"],
  usage: `${PREFIX}kiss [@usuario]`,
  handle: async ({ socket, remoteJid, sendReply, sendReact, webMessage, args }) => {
    try {
      // Leer el estado directamente desde el archivo status.json
      const currentStatus = readStatus();

      // Verificar si el sistema está apagado
      if (!currentStatus.enabled) {
        await sendReply("❌ El sistema de comandos está apagado. Por favor, enciéndelo primero.");
        return;
      }

      // Reaccionar con 💋 cuando el comando es recibido
      await sendReact("💋", webMessage.key);

      // Verificar si se mencionó o respondió a alguien
      let mentionedUser;
      if (webMessage.quotedMessage) {
        mentionedUser = webMessage.quotedMessage.key.remoteJid;
      } else if (args.length > 0) {
        mentionedUser = args[0];
      }

      // Si no hay usuario mencionado, se elige uno al azar
      if (!mentionedUser) {
        const randomJid = remoteJid; // Enviar el beso al usuario que usó el comando si no hay mención
        await socket.sendMessage(remoteJid, {
          video: fs.readFileSync(path.resolve(process.cwd(), "assets/sx/beso.mp4")),
          caption: `@${randomJid} ha enviado un beso a alguien.`,
          gifPlayback: true
        });
      } else {
        // Si hay una mención, enviar el beso a esa persona
        await socket.sendMessage(remoteJid, {
          video: fs.readFileSync(path.resolve(process.cwd(), "assets/sx/beso.mp4")),
          caption: `@${webMessage.key.remoteJid} ha enviado un beso a @${mentionedUser}.`,
          gifPlayback: true
        });
      }
    } catch (error) {
      console.error("Error al ejecutar el comando kiss:", error);
      await sendReply("❌ Hubo un error al enviar el beso.");
    }
  }
};