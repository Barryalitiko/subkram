const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "tovideo",
  description: "Convierte un archivo de audio en un vídeo con un GIF de fondo.",
  commands: ["tovideo"],
  usage: `${PREFIX}tovideo <archivo de audio>`,
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
    let audioUrl;
    if (isReply) {
      audioUrl = args[0];
    } else if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}tovideo <archivo de audio>`);
      return;
    } else {
      audioUrl = args[0];
    }

    try {
      const tempFolder = path.resolve(__dirname, "../../../assets/temp");
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      const audioFilePath = path.join(tempFolder, `${Date.now()}_audio.mp3`);
      const gifFilePath = path.resolve(__dirname, "../../../assets/images/krampgif.mp4");
      const videoFilePath = path.join(tempFolder, `${Date.now()}_video.mp4`);

      const response = await axios({ url: audioUrl, responseType: "arraybuffer" });
      fs.writeFileSync(audioFilePath, response.data);

      await sendReact("⏳");

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(audioFilePath)
          .input(gifFilePath)
          .loop(0)
          .complexFilter([
            "[1:v]scale=width=1280:height=720[gif]",
            "[0:a][gif]amerge=inputs=2[audio]",
          ])
          .map("[audio]")
          .output(videoFilePath)
          .on("end", async () => {
            await sendReact("🎥");
            await socket.sendMessage(remoteJid, {
              video: { url: videoFilePath },
              caption: `Aquí tienes el vídeo generado a partir del audio.`,
            });
            fs.unlinkSync(audioFilePath);
            fs.unlinkSync(videoFilePath);
            resolve();
          })
          .on("error", (err) => {
            console.error(err);
            sendReply("Hubo un problema al generar el vídeo.");
            reject(err);
          })
          .run();
      });
    } catch (error) {
      console.error(error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};
