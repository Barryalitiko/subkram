const { PREFIX } = require("../../krampus");
const { getAudioFromSearch } = require("../../services/ytdl");

module.exports = {
  name: "musica",
  description: "Busca y envía música desde YouTube",
  commands: ["musica", "play"],
  usage: `${PREFIX}musica <nombre de la canción o URL de YouTube>`,
  handle: async ({
    args,
    remoteJid,
    sendReply,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
    socket,
  }) => {
    if (args.length < 1) {
      return await sendReply(
        `Uso incorrecto. Por favor, proporciona el nombre de la canción o el URL. Ejemplo: ${PREFIX}musica Despacito`
      );
    }

    const query = args.join(" ");
    console.log(`[MUSICA] Buscando música para: ${query}`);

    try {
      // Mostrar la reacción de espera
      await sendWaitReact();

      // Llamar a la función para obtener el enlace de audio
      const { title, downloadURL } = await getAudioFromSearch(query);

      if (!downloadURL) {
        await sendErrorReply("No se pudo obtener el enlace de descarga.");
        return;
      }

      console.log(`[MUSICA] Enlace de audio obtenido: ${downloadURL}`);

      // Enviar el audio al usuario
      await socket.sendMessage(remoteJid, {
        audio: { url: downloadURL },
        mimetype: "audio/mpeg",
        caption: `🎶 Aquí tienes: ${title}`,
      });

      // Mostrar la reacción de éxito
      await sendSuccessReact();
      console.log(`[MUSICA] Audio enviado con éxito: ${title}`);
    } catch (error) {
      console.error(`[MUSICA] Error al buscar o enviar audio: ${error.message}`);
      await sendErrorReact();
      await sendErrorReply(
        "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo."
      );
    }
  },
};