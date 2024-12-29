const { getProfileImageData } = require("@whiskeysockets/baileys");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const { warningLog } = require("../utils/logger");
const { PREFIX } = require("../../krampus"); // Para acceder al prefix

module.exports = {
  name: "collage",
  description: "Crea un collage con las fotos de perfil de dos personas etiquetadas.",
  commands: ["collage"],
  usage: `${PREFIX}collage @persona1 @persona2`,
  handle: async ({ args, remoteJid, sendReply, mentionedJid, prefix }) => {
    if (mentionedJid.length !== 2) {
      await sendReply(`⚠️ Debes etiquetar exactamente dos personas para crear el collage.\nUso: ${prefix}collage @persona1 @persona2`);
      return;
    }

    try {
      // Obtener las fotos de perfil de las dos personas etiquetadas
      const [user1, user2] = mentionedJid;
      const { buffer: buffer1, profileImage: profileImage1 } = await getProfileImageData(socket, user1);
      const { buffer: buffer2, profileImage: profileImage2 } = await getProfileImageData(socket, user2);

      // Crear el canvas para el collage
      const canvas = createCanvas(600, 300); // El tamaño del collage
      const ctx = canvas.getContext("2d");

      // Cargar las imágenes
      const img1 = await loadImage(buffer1);
      const img2 = await loadImage(buffer2);

      // Dibujar las imágenes en el canvas
      ctx.drawImage(img1, 0, 0, 300, 300); // Primer foto en la izquierda
      ctx.drawImage(img2, 300, 0, 300, 300); // Segunda foto en la derecha

      // Guardar el collage en un buffer
      const collageBuffer = canvas.toBuffer();

      // Enviar el collage al grupo o al chat
      await socket.sendMessage(remoteJid, {
        image: collageBuffer,
        caption: "Aquí está el collage con las fotos de perfil de las dos personas etiquetadas!",
      });

      // Limpiar los archivos de las fotos de perfil si es necesario
      if (!profileImage1.includes("default-user")) fs.unlinkSync(profileImage1);
      if (!profileImage2.includes("default-user")) fs.unlinkSync(profileImage2);

    } catch (error) {
      warningLog("👻 Error al crear el collage: " + error.message);
      await sendReply("❌ Hubo un problema al crear el collage. Intenta de nuevo.");
    }
  },
};