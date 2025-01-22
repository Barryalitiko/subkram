const { PREFIX } = require("../../krampus");
const { downloadTikTokVideo } = require("../../services/ytdpl"); // Ruta correcta

module.exports = {
  name: "tiktok",
  description: "Descargar un video de TikTok",
  commands: ["tiktok", "tt"],
  usage: `${PREFIX}tiktok <URL del video>`,
  handle: async ({ socket, remoteJid, sendReply, args }) => {
    try {
      const videoUrl = args.join(" ");
      if (!videoUrl) {
        await sendReply("❌ Por favor, proporciona la URL del video de TikTok que deseas descargar.");
        return;
      }

      // Descargar el video de TikTok
      const videoPath = await downloadTikTok(videoUrl);

      // Enviar el video descargado
      await socket.sendMessage(remoteJid, {
        video: { url: videoPath },
        caption: `🎥 Aquí tienes el video de TikTok.`,
        ptt: false, // Enviar como video normal, no como nota
      });

    } catch (error) {
      console.error("Error al descargar o enviar el video de TikTok:", error);
      await sendReply("❌ Hubo un error al procesar el video de TikTok.");
    }
  },
};