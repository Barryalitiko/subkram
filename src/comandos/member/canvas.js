const { createCanvas } = require("canvas");
const { PREFIX } = require("../../krampus"); // Asegúrate de que este archivo tiene el prefijo configurado

module.exports = {
  name: "testcanvas",
  description: "Prueba básica de Canvas",
  commands: [`${PREFIX}testcanvas`], // Incluye el prefijo en el comando
  usage: `${PREFIX}testcanvas <texto>`,
  handle: async ({ args, sendReply, socket, remoteJid }) => {
    if (!args.length) {
      return await sendReply("Por favor, proporciona un texto para generar la imagen.");
    }

    const userText = args.join(" ");

    try {
      // Crear un canvas de 500x500 píxeles
      const canvas = createCanvas(500, 500);
      const ctx = canvas.getContext("2d");

      // Fondo
      ctx.fillStyle = "#282c34"; // Color de fondo
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Texto
      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "#ffffff"; // Color del texto
      ctx.fillText(userText, 50, 250); // Texto centrado

      // Guardar la imagen como buffer
      const buffer = canvas.toBuffer("image/png");

      // Enviar la imagen generada al chat
      await socket.sendMessage(remoteJid, {
        image: buffer,
        caption: `🎨 Imagen generada con: "${userText}"`,
      });

      console.log("[CANVAS] Imagen generada y enviada con éxito.");
    } catch (error) {
      console.error("[CANVAS] Error al generar la imagen:", error.message);
      await sendReply("❌ Ocurrió un error al generar la imagen. Por favor, inténtalo de nuevo.");
    }
  },
};