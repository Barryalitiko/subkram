const { PREFIX } = require("../../krampus");
const { createSticker } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,

  handle: async ({
    isImage,
    isVideo,
    handleMediaMessage, // Función para procesar los medios
    sendReply,
    sendReact,
    sendStickerFromFile,
  }) => {
    try {
      // Validar si el mensaje contiene imagen o video
      if (!isImage && !isVideo) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      await sendReact("🤔"); // Reacción mientras procesa

      // Procesar la imagen o video con handleMediaMessage
      const media = await handleMediaMessage(true); // Procesa solo si se activa

      if (!media || !media.path) {
        await sendReply("❌ No se pudo procesar la imagen o video. Intenta nuevamente.");
        return;
      }

      // Crear el sticker con los datos descargados
      const sticker = await createSticker(media.path, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });

      // Enviar el sticker generado
      await sendStickerFromFile(sticker);

      await sendReact("🧩"); // Reacción de éxito
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};