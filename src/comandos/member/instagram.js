const { PREFIX } = require("../../krampus");
const { downloadInstagramVideo } = require("../../services/ytdpl"); // Ruta correcta

module.exports = {
  name: "instagram",
  description: "Descargar un video de Instagram",
  commands: ["instagram", "insta"],
  usage: `${PREFIX}instagram <URL del video>`,
  handle: async ({ socket, remoteJid, sendReply, args }) => {
    try {
      const videoUrl = args.join(" ");
      if (!videoUrl) {
        await sendReply("❌ Por favor, proporciona la URL del video de Instagram que deseas descargar.");
        return;
      }

      // Descargar el video de Instagram
      const videoPath = await downloadInstagramVideo(videoUrl);

      // Enviar el video descargado
      await socket.sendMessage(remoteJid, {
        video: { url: videoPath },
        caption: `🎥 Aquí tienes el video de Instagram.`,
        ptt: false, // Enviar como video normal, no como nota
      });

    } catch (error) {
      console.error("Error al descargar o enviar el video de Instagram:", error);
      await sendReply("❌ Hubo un error al procesar el video de Instagram.");
    }
  },
};