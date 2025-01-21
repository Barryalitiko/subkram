const { PREFIX } = require("../../krampus");
const { downloadXVideo } = require("../../services/ytdpl");

module.exports = {
  name: "twitter",
  description: "Descargar y enviar un video de X (Twitter)",
  commands: ["twitter", "x"],
  usage: `${PREFIX}twitter <enlace del video>`,
  handle: async ({ socket, remoteJid, sendReply, args, sendWaitReact }) => {
    try {
      const videoUrl = args[0];
      if (!videoUrl) {
        return await sendReply("❌ Por favor, proporciona un enlace válido de Twitter.");
      }

      await sendWaitReact("⏳");
      const videoPath = await downloadXVideo(videoUrl);
      await socket.sendMessage(remoteJid, {
        video: { url: videoPath },
        caption: "🎬 Aquí está tu video descargado de X (Twitter).",
      });
    } catch (error) {
      await sendReply(`❌ Error: ${error}`);
    }
  },
};