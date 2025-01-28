const { PREFIX } = require("../../krampus");
const { createSticker } = require("wa-sticker-formatter");
const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const isMediaMessage = (message) => {
  return message?.message?.imageMessage || message?.message?.videoMessage;
};

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,
  handle: async (args) => {
    try {
      // Verifica si el mensaje contiene una imagen o un video
      if (!isMediaMessage(args)) {
        await args.sendReply(`❌ Responde a una imagen o video con el comando para convertirlo en un sticker.`);
        return;
      }
      
      // Reacciona al mensaje para indicar que está procesando
      await args.sendReact("🤔");

      // Descargar el contenido de la imagen o video como buffer
      const media = await downloadMediaMessage(args.message, "buffer");
      
      if (!media) {
        await args.sendReply("❌ No se pudo descargar el archivo. Intenta nuevamente.");
        return;
      }

      // Guardar temporalmente el archivo para la conversión a sticker
      const filePath = path.join(__dirname, "sticker.webp");
      fs.writeFileSync(filePath, media);

      // Crear el sticker con la biblioteca
      const sticker = await createSticker(filePath, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });

      // Enviar el sticker
      await args.sendStickerFromFile(sticker);

      // Reaccionar nuevamente cuando el sticker se haya enviado
      await args.sendReact("🧩");

      // Eliminar el archivo temporal
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await args.sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};