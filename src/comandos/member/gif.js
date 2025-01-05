const fs = require('fs');
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "gif",
  description: "Envía un GIF aleatorio desde una lista predefinida",
  commands: ["gif"],
  usage: `${PREFIX}gif`,
  cooldown: 60, // 1 minuto de cooldown
  handle: async ({ socket, sendReply, sendReact, remoteJid }) => {
    try {
      // Leer el archivo JSON con los enlaces de los GIFs
      const gifsData = JSON.parse(fs.readFileSync('./gifs.json', 'utf8'));
      const gifsList = gifsData.gifs;

      // Seleccionar un GIF aleatorio
      const randomGif = gifsList[Math.floor(Math.random() * gifsList.length)];

      // Enviar el GIF
      await socket.sendMessage(remoteJid, {
        video: { url: randomGif },
        caption: "Aquí tienes un GIF aleatorio!",
        mimetype: "image/gif",
      });

      console.log("[GIF] GIF enviado con éxito.");
      await sendReact("✅");
    } catch (error) {
      console.error("[GIF] Error al enviar el GIF:", error);
      await sendReply("❌ Ocurrió un error al enviar el GIF.");
      await sendReact("❌");
    }
  }
};