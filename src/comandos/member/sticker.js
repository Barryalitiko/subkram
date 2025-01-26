const { PREFIX } = require("../../krampus");
const { Sticker, createSticker } = require("wa-sticker-formatter");
const fs = require("fs");
const path = require("path");

const TEMP_FOLDER = path.join(__dirname, "../../temp");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,
  handle: async ({
    webMessage,
    sendReply,
    sendReact,
    sendMessage,
    isReply,
    quoted,
  }) => {
    try {
      if (!isReply || !quoted) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      if (quoted.type === 'image') {
        await sendReact("🤔", webMessage.key);
        const buffer = await quoted.download();
        const sticker = await createSticker(buffer, {
          type: "image",
          pack: "Operacion Marshall",
          author: "Krampus OM Bot",
          quality: 70,
        });
        await sendMessage(webMessage.key.remoteJid, {
          sticker: sticker,
          quoted: webMessage,
        });
        await sendReact("🧩", webMessage.key);
      } else if (quoted.type === 'video') {
        await sendReact("🤔", webMessage.key);
        const buffer = await quoted.download();
        const sticker = await createSticker(buffer, {
          type: "full",
          pack: "Operacion Marshall",
          author: "Krampus OM Bot",
          quality: 70,
        });
        await sendMessage(webMessage.key.remoteJid, {
          sticker: sticker,
          quoted: webMessage,
        });
        await sendReact("🧩", webMessage.key);
      } else {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
      }
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};
