const { PREFIX } = require("../../krampus");

module.exports = {
  name: "sticker",
  description: "Convierte una imagen en un sticker.",
  commands: ["sticker", "s"],
  usage: `${PREFIX}sticker`,
  handle: async ({ message, socket, remoteJid, sendReply }) => {
    try {
      // Verificar si el mensaje incluye una imagen
      const imageMessage = message.message?.imageMessage;

      if (!imageMessage) {
        await sendReply("❌ Por favor, responde o envía una imagen para crear el sticker.");
        return;
      }

      // Descargar la imagen
      const media = await socket.downloadMediaMessage(message);

      if (!media) {
        await sendReply("❌ Hubo un error al descargar la imagen. Intenta de nuevo.");
        return;
      }

      // Enviar la imagen como sticker
      await socket.sendMessage(remoteJid, {
        sticker: { url: media }, // Convertir la imagen en sticker
      });

      await sendReply("✅ ¡Sticker creado con éxito!");

    } catch (error) {
      console.error("Error al crear el sticker:", error);
      await sendReply("❌ Ocurrió un error al intentar crear el sticker.");
    }
  },
};