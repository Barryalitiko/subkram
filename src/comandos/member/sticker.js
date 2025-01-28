const { PREFIX } = require("../../krampus");
const { createSticker } = require("wa-sticker-formatter");
const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const isMediaMessage = (args) => {
  return args.message?.message?.imageMessage || args.message?.message?.videoMessage;
};

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,
  handle: async (args) => {
    try {
      if (!isMediaMessage(args)) {
        await args.sendReply(" Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }
      await args.sendReact("");
      const media = await downloadMediaMessage(args.message, "buffer");
      const filePath = path.join(__dirname, "sticker.webp");
      fs.writeFileSync(filePath, media);
      const sticker = await createSticker(filePath, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });
      await args.sendStickerFromFile(sticker);
      await args.sendReact("");
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await args.sendReply(" Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};
