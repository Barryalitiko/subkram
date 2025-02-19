const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "doblePerfilVideo",
  description: "Genera un video donde las fotos de perfil de dos usuarios aparecen gradualmente con un efecto de celda",
  commands: ["doblepreso"],
  usage: `${PREFIX}doblepreso @usuario1 @usuario2`,
  handle: async ({ args, socket, remoteJid, sendReply, sendReact, isReply, replyJid, senderJid, }) => {
    let userJid1, userJid2;

    if (isReply) {
      userJid1 = replyJid;
      userJid2 = args[0].replace("@", "") + "@s.whatsapp.net";
    } else if (args.length < 2) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}doblepreso @usuario1 @usuario2`);
      return;
    } else {
      userJid1 = args[0].replace("@", "") + "@s.whatsapp.net";
      userJid2 = args[1].replace("@", "") + "@s.whatsapp.net";
    }

    try {
      let profilePicUrl1, profilePicUrl2;

      try {
        profilePicUrl1 = await socket.profilePictureUrl(userJid1, "image");
        profilePicUrl2 = await socket.profilePictureUrl(userJid2, "image");
      } catch (err) {
        await sendReply(`Uno de los usuarios no tiene foto de perfil.`);
        return;
      }

      if (!profilePicUrl1 || !profilePicUrl2) {
        await sendReply(`Uno de los usuarios no tiene foto de perfil.`);
        return;
      }

      await sendReact("");

      const tempFolder = path.resolve(__dirname, "../../../assets/temp");
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      const sanitizedJid1 = userJid1.replace(/[^a-zA-Z0-9_-]/g, "_");
      const sanitizedJid2 = userJid2.replace(/[^a-zA-Z0-9_-]/g, "_");

      const imageFilePath1 = path.join(tempFolder, `${sanitizedJid1}_profile.jpg`);
      const imageFilePath2 = path.join(tempFolder, `${sanitizedJid2}_profile.jpg`);

      const outputVideoPath = path.join(tempFolder, `doble_fade.mp4`);

      const pngImagePath = path.resolve(__dirname, "../../../assets/images/celda2.png");
      const audioFilePath = path.resolve(__dirname, "../../../assets/audio/preso30.mp3");

      const response1 = await axios({ url: profilePicUrl1, responseType: "arraybuffer" });
      const response2 = await axios({ url: profilePicUrl2, responseType: "arraybuffer" });

      fs.writeFileSync(imageFilePath1, response1.data);
      fs.writeFileSync(imageFilePath2, response2.data);

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(imageFilePath1)
          .loop(10)
          .input(imageFilePath2)
          .loop(10)
          .input(pngImagePath)
          .loop(10)
          .complexFilter([
            "[1:v]format=rgba,fade=t=in:st=1:d=3[fade1]",
            "[2:v]format=rgba,fade=t=in:st=1:d=3[fade2]",
            "[0:v][fade1]overlay=0:0[final1]",
            "[final1][fade2]overlay=0:0[final]",
          ])
          .map("[final]")
          .output(outputVideoPath)
          .duration(10)
          .on("end", async () => {
            const videoWithAudioPath = path.join(tempFolder, `doble_video.mp4`);
            ffmpeg()
              .input(outputVideoPath)
              .input(audioFilePath)
              .audioCodec("aac")
              .outputOptions(["-t 10", "-preset fast"])
              .output(videoWithAudioPath)
              .on("end", async () => {
                await sendReact("");
                await socket.sendMessage(remoteJid, {
                  video: { url: videoWithAudioPath },
                  caption: `El *DICRIM* te ha capturado @${userJid1.split("@")[0]} y @${userJid2.split("@")[0]}\nTe espera un largo tiempo en la carcel. . .\n> Krampus OM bot`,
                });
                resolve();
              })
              .on("error", (err) => {
            console.error(err);
            sendReply("Hubo un problema al generar el video.");
            reject(err);
          })
          .run();
      })
      .on("error", (err) => {
        console.error(err);
        sendReply("Hubo un problema al generar el video.");
        reject(err);
      })
      .run();
  })
  .on("error", (err) => {
  console.error(err);
  sendReply("Hubo un problema al generar el video.");
  reject(err);
}).run();
});
} catch (error) {
console.error(error);
await sendReply("Hubo un error al procesar el comando.");
}
},
};
