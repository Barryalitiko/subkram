const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { onlyNumbers } = require("../utils/index");

const statusFilePath = path.resolve(process.cwd(), "assets/status.json");

const readStatus = () => {
  try {
    const data = fs.readFileSync(statusFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { enabled: false }; // Si no existe el archivo, lo creamos con estado deshabilitado
  }
};

module.exports = {
  name: "kiss",
  description: "Enviar un beso a alguien. Si no se etiqueta, se elige a alguien al azar.",
  commands: ["kiss"],
  usage: `${PREFIX}kiss @usuario`,
  handle: async ({ socket, remoteJid, sendReply, args, participants, sendReact }) => {
    try {
      const currentStatus = readStatus();
      if (!currentStatus.enabled) {
        await sendReply("❌ El sistema de comandos está apagado. Por favor, enciéndelo para usar este comando.");
        return;
      }

      // Si hay una respuesta o etiqueta
      if (args.length > 0) {
        const taggedUser = args[0].replace(/[^0-9]/g, ""); // Limpiamos para obtener solo números
        if (taggedUser) {
          await sendReact("💋", remoteJid);
          await socket.sendMessage(remoteJid, {
            video: fs.readFileSync('assets/sx/beso.mp4'),
            caption: `@${onlyNumbers(taggedUser)} ha recibido un beso de @${onlyNumbers(remoteJid)}`,
            gifPlayback: true
          });
        }
      } else {
        // Si no hay etiqueta, elegimos un usuario al azar
        const randomUser = participants[Math.floor(Math.random() * participants.length)];
        await sendReact("💋", remoteJid);
        await socket.sendMessage(remoteJid, {
          video: fs.readFileSync('assets/sx/beso.mp4'),
          caption: `@${onlyNumbers(remoteJid)} ha enviado un beso a @${onlyNumbers(randomUser.id)}`,
          gifPlayback: true
        });
      }

    } catch (error) {
      console.error("Error en el comando kiss:", error);
      await sendReply("❌ Ocurrió un error al procesar el comando.");
    }
  }
};