const { PREFIX } = require("../../krampus");
const { downloadTikTok } = require("../../services/ytdpl");
const fs = require("fs");
const cooldowns = new Map();

module.exports = {
  name: "downloadtiktok",
  description: "Descargar un video de TikTok.",
  commands: ["tiktok", "tt"],
  usage: `${PREFIX}downloadtiktok <URL del video de TikTok>`,

  handle: async ({
    args,
    socket,
    remoteJid,
    sendReply,
    sendReact,
    webMessage,
    sendMessage,
  }) => {
    try {
      const userId = remoteJid;
      const now = Date.now();
      const cooldownTime = 20 * 1000;

      if (cooldowns.has(userId)) {
        const lastUsed = cooldowns.get(userId);
        if (now - lastUsed < cooldownTime) {
          const remainingTime = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
          await sendReply(`❌ Estás en cooldown. Espera ${remainingTime} segundos para usar el comando nuevamente.`);
          return;
        }
      }

      cooldowns.set(userId, now);

      const tiktokUrl = args[0];
      if (!tiktokUrl) {
        await sendReply("❌ Por favor, proporciona la URL del video de TikTok que deseas descargar.");
        return;
      }

      await sendReply(`𝙸𝚗𝚒𝚌𝚒𝚊𝚗𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊...\n> Krampus OM bot`);

      await sendReact("⏳", webMessage.key);

      const videoPath = await downloadTikTok(tiktokUrl);

      await sendReact("🖤", webMessage.key);

      await sendMessage({
        messageType: "video",
        url: videoPath,
        mimetype: "video/mp4",
        caption: `> Krampus OM bot\n𝚅𝚒𝚍𝚎𝚘 𝚍𝚎 𝙏𝙄𝙆𝙏𝙊𝙆 𝚌𝚊𝚛𝚐𝚊𝚍𝚘.`,
      });

      setTimeout(() => {
        fs.unlink(videoPath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo de video: ${err}`);
          } else {
            console.log(`Archivo de video eliminado: ${videoPath}`);
          }
        });
      }, 1 * 60 * 1000);
    } catch (error) {
      console.error("Error al descargar el video de TikTok:", error);
      await sendReply("❌ Hubo un error al descargar el video de TikTok.");
    }
  },
};
