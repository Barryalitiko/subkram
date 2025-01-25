const { PREFIX } = require("../../krampus");
const { downloadInstagramVideo } = require("../../services/ytdpl");
const fs = require("fs");

module.exports = {
  name: "downloadinstagram",
  description: "Descargar un video de Instagram.",
  commands: ["instagram", "insta"],
  usage: `${PREFIX}downloadinstagram <URL del video de Instagram>`,

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
      const instagramUrl = args[0];
      if (!instagramUrl) {
        await sendReply("❌ Por favor, proporciona la URL del video de Instagram que deseas descargar.");
        return;
      }

      await sendReply(`𝙸𝚗𝚒𝚌𝚒𝚊𝚗𝚍𝚘 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊...\n> Krampus OM bot`);

      await sendReact("⏳", webMessage.key);

      const videoPath = await downloadInstagramVideo(instagramUrl);

      await sendReact("🧡", webMessage.key);

      await sendMessage({
        messageType: "video",
        url: videoPath,
        mimetype: "video/mp4",
        caption: `> Krampus OM bot\n𝚅𝚒𝚍𝚎𝚘 𝚍𝚎 𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖 𝚌𝚊𝚛𝚐𝚊𝚍𝚘.`,
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
      console.error("Error al descargar el video de Instagram:", error);
      await sendReply("❌ Hubo un error al descargar el video de Instagram.");
    }
  },
};
