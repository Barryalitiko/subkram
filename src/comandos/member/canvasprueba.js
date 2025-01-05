const { createCanvas, loadImage } = require("canvas"); // Importamos canvas
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "blanco-negro",
  description: "Convierte la imagen en blanco y negro",
  commands: [`${PREFIX}blanco-negro`], // Incluye el prefijo en el comando
  usage: `${PREFIX}blanco-negro <respuesta a una imagen>`,
  handle: async ({ sendReply, sendReact, socket, remoteJid, webMessage }) => {
    try {
      if (!webMessage.quoted || !webMessage.quoted.image) {
        return await sendReply("Por favor, responde a una imagen para convertirla a blanco y negro.");
      }

      await sendReact("⏳"); // Reacción de espera

      const imageUrl = webMessage.quoted.image.url; // Obtenemos la URL de la imagen
      console.log("[BLANCO NEGRO] Imagen URL:", imageUrl);

      // Cargar la imagen
      const image = await loadImage(imageUrl);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      // Dibujar la imagen en el canvas
      ctx.drawImage(image, 0, 0, image.width, image.height);

      // Convertir la imagen a blanco y negro
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Promedio para convertir en blanco y negro
        const avg = (r + g + b) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg; // Aplicamos el mismo valor a R, G, B
      }

      // Colocar la imagen modificada en el canvas
      ctx.putImageData(imageData, 0, 0);

      // Convertir el canvas a un buffer de imagen
      const buffer = canvas.toBuffer("image/png");

      // Enviar la imagen procesada al chat
      await socket.sendMessage(remoteJid, {
        image: buffer,
        caption: "Aquí está tu imagen en blanco y negro.",
      });

      console.log("[BLANCO NEGRO] Imagen convertida y enviada.");
    } catch (error) {
      console.error("[BLANCO NEGRO] Error al procesar la imagen:", error);
      await sendReply("❌ Ocurrió un error al procesar la imagen. Intenta nuevamente.");
    }
  },
};