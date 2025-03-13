const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "perfilVideo",
  description: "Genera un video donde varias imágenes aparecen gradualmente sobre la foto de perfil.",
  commands: ["toro"],
  usage: `${PREFIX}perfilvideo @usuario`,
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
    let userJid;
    if (isReply) {
      userJid = replyJid;
    } else if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}preso @usuario`);
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

      await sendReact("⏳");

      const tempFolder = path.resolve(__dirname, "../../../assets/temp");
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      const sanitizedJid = userJid.replace(/[^a-zA-Z0-9_-]/g, "_");
      const imageFilePath = path.join(tempFolder, `${sanitizedJid}_profile.jpg`);
      const outputVideoPath = path.join(tempFolder, `${sanitizedJid}_fade.mp4`);
      const audioFilePath = path.resolve(__dirname, "../../../assets/audio/preso30.mp3");

      // Descargar la foto de perfil
      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      // Definir la secuencia de imágenes
      const imageSequence = [
        path.resolve(__dirname, "../../../assets/images/toro1.png"),
        path.resolve(__dirname, "../../../assets/images/toro2.png"),
        path.resolve(__dirname, "../../../assets/images/toro3.png"),
        path.resolve(__dirname, "../../../assets/images/toro4.png"),
        path.resolve(__dirname, "../../../assets/images/toro5.png"),
      ]; // Agrega más imágenes si es necesario

      await new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg().input(imageFilePath).loop(15); // Ahora dura 15s

        // Agregar cada imagen de la secuencia al input de FFmpeg
        imageSequence.forEach((imgPath) => {
          ffmpegCommand.input(imgPath).loop(15);
        });

        // Ajustar los tiempos de aparición para que encajen en 15 segundos
        const fadeDuration = 1.5; // Cada imagen aparece en 1.5s y desaparece en 1.5s
        const interval = 3; // Cada imagen cambia cada 3 segundos

        const filters = imageSequence.map((_, index) => {
          const startTime = index * interval; // Nueva distribución en 15s
          return `[${index + 1}:v]format=rgba,fade=t=in:st=${startTime}:d=${fadeDuration},fade=t=out:st=${startTime + (interval - fadeDuration)}:d=${fadeDuration}[fade${index}]`;
        });

        // Superponer las imágenes en orden
        const overlays = imageSequence
          .map((_, index) => {
            if (index === 0) {
              return `[0:v][fade${index}]overlay=0:0[final${index}]`;
            } else {
              return `[final${index - 1}][fade${index}]overlay=0:0[final${index}]`;
            }
          })
          .join("; ");

        ffmpegCommand
          .complexFilter([...filters, overlays])
          .map(`[final${imageSequence.length - 1}]`)
          .output(outputVideoPath)
          .duration(15) // Ahora el video dura 15s
          .on("end", async () => {
            const videoWithAudioPath = path.join(tempFolder, `${sanitizedJid}_video.mp4`);
            ffmpeg()
              .input(outputVideoPath)
              .input(audioFilePath)
              .audioCodec("aac")
              .outputOptions(["-t 15", "-preset fast"]) // Ajuste a 15s
              .output(videoWithAudioPath)
              .on("end", async () => {
                await sendReact("🚔");
                await socket.sendMessage(remoteJid, {
                  video: { url: videoWithAudioPath },
                  caption: `El *DICRIM* te ha capturado @${userJid.split("@")[0]}\nTe espera un largo tiempo en la cárcel. . .\n> Krampus OM bot`,
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
      });
    } catch (error) {
      console.error(error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};