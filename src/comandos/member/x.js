const { PREFIX } = require("../../krampus");
const { downloadXVideo } = require("../../services/ytdpl");
const fs = require("fs");
const cooldowns = new Map();

module.exports = {
  name: "downloadtwitter",
  description: "Descargar un video de X (Twitter).",
  commands: ["twitter", "x"],
  usage: `${PREFIX}downloadtwitter <URL del video de Twitter>`,

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

      const twitterUrl = args[0];
      if (!twitterUrl) {
        await sendReply("❌ Por favor, proporciona la URL del video de X (Twitter) que deseas descargar.");
        return;
      }

      await sendReply(`𝙸𝚗𝚒𝚌𝚒𝚊𝚗𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊...\n> Krampus OM bot`);

      await sendReact("⏳", webMessage.key);

      const videoPath = await downloadXVideo(twitterUrl);

      await sendReact("🪽", webMessage.key);

      await sendMessage({
        messageType: "video",
        url: videoPath,
        mimetype: "video/mp4",
        caption: `> Krampus OM bot\n𝚅𝚒𝚍𝚎𝚘 𝚍𝚎 𝚇 (Twitter) 𝚌𝚊𝚛𝚐𝚊𝚍𝚘.`,
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
      console.error("Error al descargar el video de Twitter:", error);
      await sendReply("❌ Hubo un error al descargar el video de X (Twitter).");
    }
  },
};
