const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "stickerToMedia",
  description: "Convierte un sticker en una imagen o GIF (si es animado).",
  commands: ["aimagen", "toimage", "ti"],
  usage: `${PREFIX}stickerToMedia`,
  handle: async ({ webMessage, sendReply, sendReact, sendMessage, isReply, quoted }) => {
    try {
      // Verificar si el comando fue enviado respondiendo a un sticker
      if (!isReply || !quoted || quoted.mtype !== "stickerMessage") {
        await sendReply("❌ Responde a un sticker con este comando para convertirlo en imagen o GIF.");
        return;
      }

      // Reaccionar con ⏳ para indicar que el proceso ha comenzado
      await sendReact("🤔", webMessage.key);

      // Descargar el sticker
      const buffer = await quoted.download();
      if (!buffer) {
        await sendReply("❌ No se pudo descargar el sticker. Intenta nuevamente.");
        return;
      }

      // Determinar el tipo de sticker (animado o estático)
      const isAnimated = quoted.message.stickerMessage.isAnimated;

      // Guardar el archivo temporalmente
      const tempFilePath = path.resolve(
        process.cwd(),
        `temp_${Date.now()}.${isAnimated ? "gif" : "png"}`
      );
      fs.writeFileSync(tempFilePath, buffer);

      // Enviar la imagen o el GIF al chat
      if (isAnimated) {
        await sendMessage(webMessage.key.remoteJid, {
          video: { url: tempFilePath },
          caption: "Aquí está tu sticker convertido a GIF.",
          gifPlayback: true,
          quoted: webMessage,
        });
      } else {
        await sendMessage(webMessage.key.remoteJid, {
          image: { url: tempFilePath },
          caption: "Aquí está tu sticker convertido a imagen.",
          quoted: webMessage,
        });
      }

      // Reaccionar con ✅ para indicar que el proceso se completó
      await sendReact("🧩", webMessage.key);

      // Eliminar el archivo temporal después de 10 segundos
      setTimeout(() => {
        fs.unlink(tempFilePath, (err) => {
          if (err) {
            console.error("Error al eliminar el archivo temporal:", err);
          } else {
            console.log("Archivo temporal eliminado:", tempFilePath);
          }
        });
      }, 10 * 1000); // Eliminar después de 10 segundos
    } catch (error) {
      console.error("Error al convertir el sticker:", error);
      await sendReply("❌ Ocurrió un error al convertir el sticker. Por favor, inténtalo de nuevo.");
    }
  },
};