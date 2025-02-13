const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ytSearch = require("yt-search");
const { downloadMusic } = require("../../services/ytdpl");
const cooldowns = new Map();
const COOLDOWN_TIME = 25 * 1000;

module.exports = {
  name: "crearvideo",
  description: "Crea un video con la foto de perfil y la música que se especifique",
  commands: ["crearvideo"],
  usage: `${PREFIX}crearvideo <nombre de la canción>`,
  handle: async ({
    args,
    socket,
    remoteJid,
    sendReply,
    sendReact,
    isReply,
    replyJid,
    senderJid,
  }) => {
    const userId = senderJid;
    const now = Date.now();
    const cooldownTime = 25 * 1000;

    if (cooldowns.has(userId)) {
      const lastUsed = cooldowns.get(userId);
      if (now - lastUsed < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
        await sendReply(`Espera ${remainingTime} segundos antes de volver a usar el comando.`);
        return;
      }
    }

    cooldowns.set(userId, now);

    if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}crearvideo <nombre de la canción>`);
      return;
    }

    const videoQuery = args.join(" ");

    try {
      const searchResult = await ytSearch(videoQuery);
      const video = searchResult.videos[0];

      if (!video) {
        await sendReply("No se encontró ningún video con ese nombre.");
        return;
      }

      const videoUrl = video.url;
      const videoTitle = video.title;

      const musicPath = await downloadMusic(videoUrl, 15);

      const profilePicUrl = await socket.profilePictureUrl(senderJid, "image");
      const imageFilePath = path.resolve(__dirname, "../../../assets/temp", `${senderJid}_profile.jpg`);
      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      const videoFilePath = path.resolve(__dirname, "../../../assets/temp", `${senderJid}_video.mp4`);
      const texto = `Hola, soy @${senderJid.split("@")[0]}\nEscuchando: ${videoTitle}`;

      ffmpeg()
        .input(imageFilePath)
        .loop(1)
        .input(musicPath)
        .audioCodec("aac")
        .videoCodec("libx264")
        .outputOptions([
          "-t 15",
          "-vf",
          `drawtext=text='${texto}':x=(w-tw)/2:y=h-(2*lh):fontsize=24:fontcolor=black:box=1:boxcolor=white:boxborderw=5,fade=t=in:st=0:d=4`,
          "-preset fast",
        ])
        .output(videoFilePath)
        .on("end", async () => {
          try {
            await socket.sendMessage(remoteJid, {
              video: {
                url: videoFilePath,
              },
              caption: `Aquí está tu video, @${senderJid.split("@")[0]}`,
              mentions: [senderJid],
            });
            fs.unlinkSync(imageFilePath);
            fs.unlinkSync(videoFilePath);
            fs.unlinkSync(musicPath);
          } catch (error) {
            console.error(error);
            await sendReply("Hubo un problema al generar el video.");
          }
        })
        .on("error", (err) => {
          console.error(err);
          sendReply("Hubo un problema al crear el video.");
        })
        .run();
    } catch (error) {
      console.error(error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};
