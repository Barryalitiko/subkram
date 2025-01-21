const { PREFIX } = require("../../krampus");
const { downloadFacebookVideo } = require("../../services/ytdpl");

module.exports = {
  name: "facebook",
  description: "Descargar y enviar un video de Facebook",
  commands: ["facebook", "fb"],
  usage: `${PREFIX}facebook <enlace del video>`,
  handle: async ({ socket, remoteJid, sendReply, args, sendWaitReact }) => {
    try {
      const videoUrl = args[0];
      if (!videoUrl) {
        return await sendReply("❌ Por favor, proporciona un enlace válido de Facebook.");
      }

      await sendWaitReact("⏳");
      const videoPath = await downloadFacebookVideo(videoUrl);
      await socket.sendMessage(remoteJid, {
        video: { url: videoPath },
        caption: "🎬 Aquí está tu video descargado de Facebook.",
      });
    } catch (error) {
      await sendReply(`❌ Error: ${error}`);
    }
  },
};