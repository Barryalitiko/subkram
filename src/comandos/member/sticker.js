const { PREFIX } = require("../../krampus");
const { createSticker } = require("wa-sticker-formatter");
const { downloadMediaMessage, getContentType } = require("@whiskeysockets/baileys");
const { createWriteStream } = require("fs");
const path = require("path");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,
  handle: async (args) => {
    try {
      if (!args.message.quoted) {
        await args.sendReply(` Responde a una imagen o video con el comando para convertirlo en un sticker.`);
        return;
      }
      const quotedMessage = args.message.quoted;
      const messageType = getContentType(quotedMessage);
      if (messageType !== 'imageMessage' && messageType !== 'videoMessage') {
        await args.sendReply(` Responde a una imagen o video con el comando para convertirlo en un sticker.`);
        return;
      }
      await args.sendReact("");
      const stream = await downloadMediaMessage(quotedMessage, 'stream');
      const filePath = path.join(__dirname, "sticker." + (messageType === 'imageMessage' ? 'jpeg' : 'webp'));
      const writeStream = createWriteStream(filePath);
      stream.pipe(writeStream);
      writeStream.on('finish', async () => {
        const sticker = await createSticker(filePath, {
          type: "full",
          pack: "Operacion Marshall",
          author: "Krampus OM Bot",
          quality: 70,
        });
        await args.sendStickerFromFile(sticker);
        await args.sendReact("");
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await args.sendReply(" Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};
