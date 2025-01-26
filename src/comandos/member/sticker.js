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
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
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

      if (!isImage && !isVideo) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      await sendReact("🤔", webMessage.key);

      let buffer;
      let filePath;

      // Si es una imagen
      if (isImage) {
        buffer = await downloadImage(webMessage, "input");
        filePath = path.join(TEMP_FOLDER, "image.png"); // Guardar en carpeta temporal
        fs.writeFileSync(filePath, buffer); // Escribir el archivo en la carpeta temporal
      } 
      // Si es un video
      else if (isVideo) {
        buffer = await downloadVideo(webMessage, "input");
        filePath = path.join(TEMP_FOLDER, "video.mp4"); // Guardar en carpeta temporal
        fs.writeFileSync(filePath, buffer); // Escribir el archivo en la carpeta temporal
      }

      if (!buffer) {
        await sendReply("❌ No se pudo descargar el archivo. Intenta nuevamente.");
        return;
      }

      // Crear el sticker
      const sticker = await createSticker(filePath, {
        type: "full",
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70,
      });

      // Enviar el sticker
      await sendMessage(webMessage.key.remoteJid, {
        sticker: sticker,
        quoted: webMessage,
      });

      await sendReact("🧩", webMessage.key);

      // Eliminar el archivo temporal después de enviarlo
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};