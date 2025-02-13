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
      const audioFilePath = path.resolve(__dirname, "../../../assets/audio/audio.mp3");

      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(imageFilePath) // Entrada de la imagen de perfil
          .loop(10) // Hace que la imagen de perfil dure 10s
          .input(pngImagePath) // Entrada del PNG
          .loop(10) // Hace que la imagen PNG dure 10s
          .input(audioFilePath) // Entrada del audio
          .audioCodec("aac") // Codec de audio para asegurar la compatibilidad
          .output(outputVideoPath)
          .duration(10) // Duración del video (10 segundos)
          .outputOptions(["-shortest"]) // Asegura que el video no termine antes de tiempo
          .on("end", async () => {
            await socket.sendMessage(remoteJid, {
              video: { url: outputVideoPath },
              caption: `Aquí tienes un video donde la imagen de @${userJid.split("@")[0]} se combina con el PNG y el audio.`,
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
