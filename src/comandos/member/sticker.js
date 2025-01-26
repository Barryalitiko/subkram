const { PREFIX } = require("../../krampus");
const { Sticker, createSticker } = require("wa-sticker-formatter");
const fs = require("fs");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen o video en un sticker conservando la proporción original.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,
  handle: async ({ webMessage, sendReply, sendReact, sendMessage, args, isReply, quoted }) => {
    try {
      // Verificar si el comando fue enviado respondiendo a un mensaje con imagen o video
      if (!isReply || !quoted || (quoted.mtype !== "imageMessage" && quoted.mtype !== "videoMessage")) {
        await sendReply("❌ Responde a una imagen o video con el comando para convertirlo en un sticker.");
        return;
      }

      // Reaccionar con ⏳ para indicar que el proceso ha comenzado
      await sendReact("🤔", webMessage.key);

      // Descargar el archivo multimedia
      const buffer = await quoted.download();
      if (!buffer) {
        await sendReply("❌ No se pudo descargar el archivo. Intenta nuevamente.");
        return;
      }

      // Crear el sticker conservando la proporción original
      const sticker = await createSticker(buffer, {
        type: "full", // Conserva la proporción original
        pack: "Operacion Marshall",
        author: "Krampus OM Bot",
        quality: 70, // Calidad del sticker
      });

      // Enviar el sticker al chat
      await sendMessage(webMessage.key.remoteJid, {
        sticker: sticker,
        quoted: webMessage, // Responde al mensaje original del usuario
      });

      // Reaccionar con ✅ para indicar que el proceso se completó
      await sendReact("🧩", webMessage.key);
    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al crear el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};