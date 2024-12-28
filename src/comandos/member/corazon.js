const { PREFIX } = require("../../krampus");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "corazon",
  description: "Añade un corazón al centro de la foto de perfil de un usuario etiquetado.",
  commands: ["corazon"],
  usage: `${PREFIX}corazon @usuario`,
  handle: async ({ socket, sendReply, sendErrorReply, sendReact, remoteJid, webMessage }) => {
    try {
      await sendReact("⏳");

      // Obtener el JID del usuario etiquetado (si existe)
      const mentionedJid = webMessage.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const targetJid = mentionedJid || webMessage.key.participant; // Si no hay mención, usar el remitente

      // Obtener la foto de perfil del usuario objetivo
      const profilePictureUrl = await socket.profilePictureUrl(targetJid, "image").catch(() => null);
      if (!profilePictureUrl) {
        await sendReact("❌");
        return sendErrorReply("No se pudo obtener la foto de perfil del usuario.");
      }

      // Cargar la imagen de perfil
      const response = await fetch(profilePictureUrl);
      const buffer = await response.buffer();
      const avatar = await Canvas.loadImage(buffer);

      // Crear lienzo y contexto
      const canvas = Canvas.createCanvas(avatar.width, avatar.height);
      const ctx = canvas.getContext("2d");

      // Dibujar la imagen de perfil
      ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

      // Añadir un corazón al centro
      const heartImagePath = path.resolve(__dirname, "../../assets/heart.png"); // Ruta de la imagen del corazón
      const heartImage = await Canvas.loadImage(heartImagePath);
      const heartSize = canvas.width * 0.2; // Ajustar el tamaño del corazón (20% del ancho)
      const heartX = (canvas.width - heartSize) / 2;
      const heartY = (canvas.height - heartSize) / 2;
      ctx.drawImage(heartImage, heartX, heartY, heartSize, heartSize);

      // Guardar la imagen editada
      const outputPath = path.resolve(__dirname, "../../temp/edited-profile.jpg");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createJPEGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        // Enviar la imagen resultante
        await socket.sendMessage(remoteJid, {
          image: { url: outputPath },
          caption: "Aquí está la foto con un corazón 💖",
        });

        // Eliminar el archivo temporal
        fs.unlinkSync(outputPath);
        await sendReact("✅");
      });
    } catch (error) {
      console.error("[CORAZON] Error:", error);
      await sendReact("❌");
      await sendErrorReply("Hubo un error al editar la imagen. Intenta nuevamente.");
    }
  },
};