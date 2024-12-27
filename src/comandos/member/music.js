const { PREFIX } = require("../../krampus");
const { searchAndDownload } = require("../../utils/loadCommonFunctions");

module.exports = {
  name: "musica",
  description: "Descargar y enviar música de YouTube",
  commands: ["musica"],
  usage: `${PREFIX}musica <nombre de la canción>`,
  handle: async ({
    args,
    sendReply,
    sendWaitReply,
    sendErrorReply,
    sendReact,
    socket,
    remoteJid,
  }) => {
    if (!args.length) {
      await sendReact("❌");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      // Usar la función exportada desde loadCommonFunctions.js
      const audioUrl = await searchAndDownload(query);

      // Enviar el audio al grupo
      await socket.sendMessage(remoteJid, {
        audio: { url },
        mimetype: "audio/mpeg",
        fileName: `${query}.mp3`,
      });

      await sendReact("✅");
      await sendReply(`¡Canción enviada!`);
    } catch (error) {
      console.error("Error al procesar el comando música:", error);
      await sendReact("❌");
      await sendErrorReply("Hubo un error al procesar tu solicitud. Inténtalo de nuevo.");
    }
  },
};