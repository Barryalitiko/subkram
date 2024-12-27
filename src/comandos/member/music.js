const ytdl = require("ytdl-core");
const { youtubeSearch } = require("youtube-search-api");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "descargar",
  description: "Descargar música desde YouTube",
  commands: ["descargar"],
  usage: `${PREFIX}descargar <nombre de la canción>`,
  handle: async ({ sendReply, sendReact, message, args }) => {
    if (args.length === 0) {
      await sendReply("Por favor, proporciona el nombre de la canción.");
      return;
    }

    const songName = args.join(" ");
    console.log(`Buscando la canción: ${songName}`);
    
    try {
      // Buscar la canción en YouTube
      const searchResults = await youtubeSearch(songName);
      const video = searchResults.items[0];

      if (!video) {
        await sendReply("No se encontraron resultados para esa canción.");
        return;
      }

      console.log(`Encontrado video: ${video.title}`);

      // Descargar la canción
      const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" });
      await sendReply(`Descargando: ${video.title}`);

      // Enviar la canción como un archivo de audio
      stream.pipe(fs.createWriteStream(`${video.title}.mp3`));

      // Esperar a que se descargue y enviar el archivo
      stream.on("end", async () => {
        await sendReply(`Enviando: ${video.title}`);
        await sendReact("🎶");

        // Enviar audio al usuario
        await sendReply({
          audio: fs.createReadStream(`${video.title}.mp3`),
          mimetype: "audio/mp4",
          ptt: true
        });

        fs.unlinkSync(`${video.title}.mp3`); // Borrar el archivo después de enviarlo
        console.log(`Canción enviada: ${video.title}`);
      });
    } catch (error) {
      console.error("Error al descargar la canción:", error);
      await sendReply("Hubo un error al descargar la canción. Intenta nuevamente.");
    }
  },
};
