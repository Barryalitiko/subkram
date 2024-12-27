const { PREFIX } = require("../../krampus");

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
      console.log(`Buscando canción: "${query}"`);

      // Usamos la función searchAndDownload para obtener la URL del audio
      const audioUrl = await searchAndDownload(query);
      console.log("URL de audio obtenida:", audioUrl);

      if (!audioUrl) {
        throw new Error("No se pudo obtener la URL del audio.");
      }

      // Enviamos el audio al grupo usando el socket
      await socket.sendMessage(remoteJid, {
        audio: { url: audioUrl }, // Pasamos la URL del audio
        mimetype: "audio/mpeg",   // Especificamos el tipo de archivo
        fileName: `${query}.mp3`, // Nombre del archivo (opcional)
      });

      await sendReact("✅");
      await sendReply(`¡Canción enviada!`);
    } catch (error) {
      console.error("Error al procesar el comando música:", error);
      await sendReact("❌");
      await sendErrorReply(`Hubo un error: ${error.message}`);
    }
  },
};