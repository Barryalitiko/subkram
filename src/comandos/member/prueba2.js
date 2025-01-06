const { PREFIX } = require("../../krampus");
const { getAudioLinkFromSearch, getVideoLinkFromSearch } = require("../../services/ytdl");

module.exports = {
  name: "musica",
  description: "Busca y envía música o video desde YouTube",
  commands: ["musica", "play"],
  usage: `${PREFIX}musica <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, sendWaitReact, sendSuccessReact, sendErrorReply, sendErrorReact, socket }) => {
    if (args.length < 1) {
      return await sendReply(`Uso incorrecto. Por favor, proporciona el nombre de la canción o el URL. Ejemplo: ${PREFIX}musica [nombre o URL]`);
    }

    const query = args.join(" ");
    console.log(`[MUSICA] Buscando música para: ${query}`);

    try {
      // Mostrar la reacción de espera
      await sendWaitReact();

      // Buscar el enlace de descarga para audio o video
      let data;
      if (query.includes("youtube.com") || query.includes("youtu.be")) {
        data = await getVideoLinkFromSearch(query); // Usamos directamente el enlace si ya es de YouTube
      } else {
        data = await getAudioLinkFromSearch(query); // Realizamos la búsqueda si es solo un nombre
      }

      if (!data) {
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se encontró la canción o video.");
        return;
      }

      console.log(`[MUSICA] Enlace de descarga obtenido: ${data.downloadURL}`);

      // Enviar el audio o video al usuario
      if (data.type === 'audio') {
        await socket.sendMessage(remoteJid, {
          audio: { url: data.downloadURL },
          mimetype: "audio/mpeg",
          caption: `🎶 Aquí tienes: ${data.videoTitle}`,
        });
      } else if (data.type === 'video') {
        await socket.sendMessage(remoteJid, {
          video: { url: data.downloadURL },
          caption: `🎥 Aquí tienes: ${data.videoTitle}`,
        });
      }

      await sendSuccessReact();
      console.log(`[MUSICA] Audio o video enviado con éxito: ${data.videoTitle}`);
    } catch (error) {
      console.error(`[MUSICA] Error al buscar o descargar: ${error.message}`);
      await sendErrorReply("Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
    }
  },
};