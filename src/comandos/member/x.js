const { PREFIX } = require("../../krampus");
const { downloadXVideo } = require("../../services/ytdpl");
const fs = require("fs");

module.exports = {
  name: "downloadtwitter",
  description: "Descargar un video de X (Twitter).",
  commands: ["twitter", "x"],
  usage: `${PREFIX}downloadtwitter <URL del video de Twitter>`,
  handle: async ({ args, socket, remoteJid, sendReply, sendReact, webMessage }) => {
    try {
      const twitterUrl = args[0];
      if (!twitterUrl) {
        await sendReply("❌ Por favor, proporciona la URL del video de X (Twitter) que deseas descargar.");
        return;
      }

      // Responder con un mensaje de "procesando..."
      await sendReply(`𝙸𝚗𝚒𝚌𝚒𝚊𝚗𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊...\n> Krampus OM bot`);

      // Reaccionar con ⏳ al recibir el comando
      await sendReact("⏳", webMessage.key);

      // Descargar el video usando la función para X (Twitter)
      const videoPath = await downloadXVideo(twitterUrl);

      // Cambiar la reacción a 🎬 una vez que el video se descargó
      await sendReact("🪽", webMessage.key);

      // Enviar el video descargado
      await socket.sendMessage(remoteJid, {
        video: { url: videoPath },
        caption: `> Krampus OM bot\n𝚅𝚒𝚍𝚎𝚘 𝚍𝚎 𝚇 (Twitter) 𝚌𝚊𝚛𝚐𝚊𝚍𝚘.`,
        quoted: webMessage, // Responde al mensaje original del usuario
        ptt: false, // Enviar como video normal, no como nota
      });

      // Eliminar el archivo después de enviarlo
      setTimeout(() => {
        fs.unlink(videoPath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo de video: ${err}`);
          } else {
            console.log(`Archivo de video eliminado: ${videoPath}`);
          }
        });
      }, 1 * 60 * 1000); // Eliminar después de 1 minuto

    } catch (error) {
      console.error("Error al descargar el video de Twitter:", error);
      await sendReply("❌ Hubo un error al descargar el video de X (Twitter).");
    }
  },
};