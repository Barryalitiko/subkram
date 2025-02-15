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
audioUrl = await socket.downloadMediaMessage(replyJid);
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

  const sanitizedJid = senderJid.replace(/[^a-zA-Z0-9_-]/g, "_");
  const audioFilePath = path.join(tempFolder, `${sanitizedJid}_audio.mp3`);
  const gifFilePath = path.resolve(__dirname, "../../../assets/images/krampgif.mp4");
  const videoFilePath = path.join(tempFolder, `${sanitizedJid}_video.mp4`);

  const response = await axios({ url: audioUrl, responseType: "arraybuffer" });
  fs.writeFileSync(audioFilePath, response.data);

  await sendReact("⏳");

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(audioFilePath)
      .input(gifFilePath)
      .loop(0) // Repite el GIF en bucle
      .complexFilter([
        "[1:v]scale=width=1280:height=720[gif]", // Escala el GIF a 1280x720
        "[0:a][gif]amerge=inputs=2[audio]", // Fusiona el audio con el GIF
      ])
      .map("[audio]")
      .output(videoFilePath)
      .on("end", async () => {
        await sendReact("🎥");
        await socket.sendMessage(remoteJid, {
          video: { url: videoFilePath },
          caption: `Aquí tienes el vídeo generado a partir del audio.`,
        });
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

