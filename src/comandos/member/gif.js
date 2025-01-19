const { PREFIX } = require("../../krampus");
const axios = require('axios');

module.exports = {
  name: "gif",
  description: "Enviar un GIF",
  commands: ["gif"],
  usage: `${PREFIX}gif`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      const gifUrl = 'https://drive.google.com/uc?id=1nKsYxXKjCOaQjYIytsVRYfNMpqZ4urvj';
      const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
      const gifBuffer = response.data;

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
