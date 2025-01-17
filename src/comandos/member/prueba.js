const { PREFIX } = require("../../krampus");
const fs = require('fs');

module.exports = {
  name: "gif",
  description: "Enviar un GIF",
  commands: ["gif"],
  usage: `${PREFIX}gif`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      const gifPath = 'C:/Desktop/Nueva carpeta/beso.gif';
      const gifBuffer = fs.readFileSync(gifPath);

      await socket.sendMessage(remoteJid, {
        video: gifBuffer,
        gifPlayback: true,
      });
    } catch (error) {
      console.error("Error al enviar el GIF:", error);
      await sendReply("❌ Hubo un error al enviar el GIF");
    }
  }
};
