const { PREFIX } = require("../../krampus");
const { createSticker } = require("wa-sticker-formatter");
const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const isMediaMessage = (args) => {
  console.log("Estructura del mensaje:", args.message);  // Añadimos esta línea para depuración

  // Revisa si el mensaje contiene una imagen o un video
  return args.message?.imageMessage || args.message?.videoMessage || args.message?.documentMessage;
};

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,
  handle: async (args) => {
    try {
      // Asegúrate de que el mensaje tiene una imagen o un video
      if (!isMediaMessage(args)) {
        await args.sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      await args.sendReact("🤔");

      // Descargar el archivo de medios (imagen o video)
      const media = await downloadMediaMessage(args.message, "buffer");

      if (!media) {
        await args.sendReply("❌ No se pudo descargar el archivo. Intenta nuevamente.");
        return;
      }

      // Guardamos el archivo en una ubicación temporal
      const filePath = path.join(__dirname, "sticker.webp");
      fs.writeFileSync(filePath, media);

      // Crear el sticker a partir del archivo descargado
      const sticker = await createSticker(filePath, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });

      // Enviar el sticker
      await args.sendStickerFromFile(sticker);

      // Reacción indicando que se ha enviado el sticker
      await args.sendReact("🧩");

      // Borrar el archivo temporal
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await args.sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};