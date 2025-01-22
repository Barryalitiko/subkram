const { PREFIX } = require("../../krampus");
const { downloadVideo } = require("../../services/ytdpl"); // Asegúrate de que esta ruta sea correcta

module.exports = {
  name: "downloadvideo",
  description: "Descargar un video de YouTube.",
  commands: ["downloadvideo", "dv"],
  usage: `${PREFIX}downloadvideo <URL del video de YouTube>`,
  handle: async ({ args, socket, remoteJid, sendReply, sendReact, webMessage }) => {
    try {
      const videoUrl = args[0];
      if (!videoUrl) {
        await sendReply("❌ Por favor, proporciona la URL del video de YouTube que deseas descargar.");
        return;
      }

      // Responder con un mensaje de "procesando..."
      await sendReply(`> Krampus Bot👻
        procesando...`);

      // Reaccionar con ⏳ al recibir el comando
      await sendReact("⏳", webMessage.key);

      // Descargar el video usando yt-dlp
      const videoPath = await downloadVideo(videoUrl);

      // Cambiar la reacción a 🎬 una vez que el video se descargó
      await sendReact("🎬", webMessage.key);

      // Enviar el video descargado
      await socket.sendMessage(remoteJid, {
        video: { url: videoPath },
        caption: `> Krampus Bot👻\nVideo descargado exitosamente.`,
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
      console.error("Error al descargar el video:", error);
      await sendReply("❌ Hubo un error al descargar el video.");
    }
  },
};