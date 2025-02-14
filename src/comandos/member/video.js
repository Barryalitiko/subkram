const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "perfilVideo",
  description: "Genera un video donde el PNG aparece gradualmente sobre la foto de perfil.",
  commands: ["perfilvideo", "videoperfil"],
  usage: `${PREFIX}perfilvideo @usuario`,
  handle: async ({ args, socket, remoteJid, sendReply, isReply, replyJid, senderJid }) => {
    let userJid;
    if (isReply) {
      userJid = replyJid;
    } else if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}perfilvideo @usuario`);
      return;
    } else {
      userJid = args[0].replace("@", "") + "@s.whatsapp.net";
    }

    try {
      let profilePicUrl;
      try {
        profilePicUrl = await socket.profilePictureUrl(userJid, "image");
      } catch (err) {
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
        return;
      }

      if (!profilePicUrl) {
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
        return;
      }

      const tempFolder = path.resolve(__dirname, "../../../assets/temp");
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      const sanitizedJid = userJid.replace(/[^a-zA-Z0-9_-]/g, "_");
      const imageFilePath = path.join(tempFolder, `${sanitizedJid}_profile.jpg`);
      const outputVideoPath = path.join(tempFolder, `${sanitizedJid}_profile_fade.mp4`);
      const pngImagePath = path.resolve(__dirname, "../../../assets/images/celda2.png");

      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(imageFilePath)
          .loop(10) // Hace que la imagen de perfil dure 10s
          .input(pngImagePath)
          .loop(10) // Hace que la imagen PNG dure 10s
          .complexFilter([
            "[1:v]format=rgba,fade=t=in:st=1:d=3[fade]", // Fade-in en la imagen PNG
            "[0:v][fade]overlay=0:0[final]" // Superpone el PNG sobre la imagen de perfil
          ])
          .map("[final]")
          .output(outputVideoPath)
          .duration(10)
          .outputOptions(["-shortest"]) // Asegura que el video no termine antes de tiempo
          .on("end", async () => {
            await socket.sendMessage(remoteJid, {
              video: { url: outputVideoPath },
              caption: `Aquí tienes un video donde la imagen de @${userJid.split("@")[0]} se combina con el PNG.`,
            });
            resolve();
          })
          .on("error", (err) => {
            sendReply("Hubo un problema al generar el video.");
            reject(err);
          })
          .run();
      });
    } catch (error) {
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};
