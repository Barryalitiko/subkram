const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "improve",
  description: "Mejorar la calidad de una imagen",
  commands: ["improve", "enhance"],
  usage: `${PREFIX}improve <imagen>`,
  handle: async ({ socket, remoteJid, sendReply, args, message, isImage }) => {
    try {
      if (!isImage) {
        return await sendReply("❌ Por favor, envía una imagen para mejorar.");
      }

      let imageMessage;
      if (message.message.extendedTextMessage) {
        imageMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
      } else {
        imageMessage = message.message.imageMessage;
      }

      const imageBuffer = await socket.downloadMediaMessage(imageMessage);
      const outputFilePath = path.join(__dirname, "assets", "enhanced-image.jpg");

      await sharp(imageBuffer)
        .resize({ width: 1920, height: 1080, fit: sharp.fit.inside })
        .sharpen()
        .normalize()
        .toFile(outputFilePath);

      await socket.sendMessage(remoteJid, {
        image: { url: outputFilePath },
        caption: " Aquí está tu imagen mejorada.",
      });

      setTimeout(() => {
        fs.unlink(outputFilePath, (err) => {
          if (err) console.error("Error al eliminar la imagen:", err);
        });
      }, 5000);
    } catch (error) {
      console.error("Error al mejorar la imagen:", error);
      await sendReply("❌ Hubo un error al procesar tu solicitud.");
    }
  },
};
