const { PREFIX } = require("../../krampus");
const { createSticker } = require("wa-sticker-formatter");
const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const isMediaMessage = (message) => {
  return message.message?.imageMessage || message.message?.videoMessage;
};

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,
  handle: async ({ message, sendReply, sendReact, sendStickerFromFile }) => {
    try {
      if (!isMediaMessage(message)) {
        await sendReply(" Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }
      await sendReact("");
      const media = await downloadMediaMessage(message, "buffer");
      const filePath = path.join(__dirname, "sticker.webp");
      fs.writeFileSync(filePath, media);
      const sticker = await createSticker(filePath, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });
      await sendStickerFromFile(sticker);
      await sendReact("");
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply(" Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};
