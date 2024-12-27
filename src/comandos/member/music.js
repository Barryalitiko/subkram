const { PREFIX } = require("../../krampus");  // Asegúrate de importar el prefijo desde tu configuración

module.exports = {
  name: "musica",
  description: "Descargar música de YouTube en formato MP3",
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
    searchAndDownload,
    sendAudioFromURL,
  }) => {
    // Verificar si los argumentos están vacíos
    if (!args.length) {
      await sendReact("❌");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      // Buscar la URL de descarga usando searchAndDownload
      const audioUrl = await searchAndDownload(query);

      // Enviar el audio al grupo
      await sendAudioFromURL(audioUrl);

      await sendReact("✅");
      await sendReply(`¡Canción enviada!`);
    } catch (error) {
      console.error("Error al procesar el comando música:", error);
      await sendReact("❌");
      await sendErrorReply("Hubo un error al procesar tu solicitud. Inténtalo de nuevo.");
    }
  },
};