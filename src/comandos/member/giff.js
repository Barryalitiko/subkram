const { PREFIX } = require("../../krampus");
module.exports = {
  name: "gif",
  description: "Enviar un GIF",
  commands: ["gif"],
  usage: `${PREFIX}gif`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      const gifUrl = 'https://drive.google.com/uc?id=1nKsYxXKjCOaQjYIytsVRYfNMpqZ4urvj';
      await socket.sendMessage(remoteJid, { video: { url: gifUrl }, gifPlayback: true });
    } catch (error) {
      console.error("Error al enviar el GIF:", error);
      await sendReply("❌ Hubo un error al enviar el GIF");
    }
  }
};

