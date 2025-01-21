const { PREFIX } = require("../../krampus");
const ytSearch = require("yt-search");
const { downloadYouTubeMusic } = require("../../services/ytdpl");

module.exports = {
  name: "ytmusic",
  description: "Descargar y enviar música desde YouTube Music",
  commands: ["ytmusic", "ytm"],
  usage: `${PREFIX}ytmusic <nombre de la canción>`,
  handle: async ({ socket, remoteJid, sendReply, args, sendWaitReact }) => {
    try {
      const query = args.join(" ");
      if (!query) {
        return await sendReply("❌ Por favor, proporciona el nombre de la canción.");
      }

      // Buscar la canción en YouTube Music
      const searchResults = await ytSearch(query);
      
      // Filtrar los resultados para obtener solo enlaces de YouTube Music
      const youtubeMusicResult = searchResults.videos.find(
        (video) => video.url.includes("music.youtube.com")
      );

      if (!youtubeMusicResult) {
        return await sendReply("❌ No se encontraron resultados en YouTube Music.");
      }

      // Enviar reacción de espera
      await sendWaitReact("⏳");

      // Descargar la música desde YouTube Music
      const musicPath = await downloadYouTubeMusic(youtubeMusicResult.url);

      // Enviar el archivo de música descargado al usuario
      await socket.sendMessage(remoteJid, {
        audio: { url: musicPath },
        mimetype: "audio/mp4",
        caption: `🎶 Aquí está tu música descargada de YouTube Music: ${youtubeMusicResult.title}`,
        ptt: false, // Cambiar a true si deseas que sea un mensaje de voz
      });

    } catch (error) {
      console.error("Error al descargar música desde YouTube Music:", error);
      await sendReply("❌ Hubo un error al procesar tu solicitud.");
    }
  },
};