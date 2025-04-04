const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { downloadMusic } = require("../../services/ytdpl");
const ytSearch = require("yt-search");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "musical",
  description: "Genera un video con una imagen y 20 segundos de música",
  commands: ["musical", "mv", "musicvideo"],
  usage: `${PREFIX}musical <nombre de canción> (responder a una imagen)`,
  handle: async ({
    webMessage,
    isReply,
    isImage,
    args,
    downloadImage,
    sendErrorReply,
    sendSuccessReact,
    sendWaitReact,
    sendVideoFromFile,
    sendReply,
  }) => {
    if (!isReply || !isImage) {
      throw new WarningError("Debes responder a una imagen y escribir el nombre de la canción.");
    }

    const query = args.join(" ");
    if (!query) {
      throw new WarningError("Por favor, escribe el nombre de la canción después del comando.");
    }

    await sendWaitReact("🎶");

    try {
      // Buscar video
      const searchResult = await ytSearch(query);
      const video = searchResult.videos[0];
      if (!video) throw new WarningError("No encontré ningún video con ese nombre.");

      // Descargar imagen
      const imagePath = await downloadImage(webMessage, "temp_image");

      // Descargar audio
      const fullAudioPath = await downloadMusic(video.url);
      const clippedAudioPath = "temp_clip.mp3";

      // Cortar a 20 segundos usando ffmpeg
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -y -i "${fullAudioPath}" -t 20 -acodec copy "${clippedAudioPath}"`, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Crear video con imagen + audio
      const outputVideoPath = "temp_video.mp4";
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -y -loop 1 -i "${imagePath}" -i "${clippedAudioPath}" -c:v libx264 -t 20 -pix_fmt yuv420p -vf scale=640:640 -c:a aac -b:a 192k -shortest "${outputVideoPath}"`, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Enviar video
      await sendSuccessReact();
      await sendVideoFromFile(outputVideoPath, `🎶 ${video.title}\n🎤 ${video.author.name}`);

      // Limpiar archivos
      [imagePath, fullAudioPath, clippedAudioPath, outputVideoPath].forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
    } catch (error) {
      console.error("Error al generar el video musical:", error);
      await sendErrorReply("❌ Ocurrió un error al generar el video musical.");
    }
  },
};
