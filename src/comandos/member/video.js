const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "miniVideo",
  description: "Genera un mini video con la foto de perfil de un usuario y un audio.",
  commands: ["minivideo", "videoPerfil"],
  usage: `${PREFIX}minivideo @usuario`,
  handle: async ({ args, socket, remoteJid, sendReply, sendReact, isReply, replyJid }) => {
    let userJid;

    if (isReply) {
      userJid = replyJid;
    } else if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}minivideo @usuario`);
      return;
    } else {
      userJid = args[0].replace("@", "") + "@s.whatsapp.net";
    }

    try {
      // Obtener la foto de perfil del usuario usando la lógica del comando profilepic
      let profilePicUrl;
      try {
        profilePicUrl = await socket.profilePictureUrl(userJid, "image");
      } catch (err) {
        console.error("Error al obtener la foto de perfil:", err);
      }

      // Verificar si se obtuvo la foto de perfil
      if (!profilePicUrl) {
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil, no puedo generar el video.`);
        return;
      }

      // Crear la carpeta temp si no existe
      const tempFolder = path.resolve(__dirname, "temp");
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder);
      }

      // Descargamos la imagen
      const imageFilePath = path.resolve(tempFolder, `${userJid}_profile.jpg`);
      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      // Ruta del archivo de audio (puedes cambiarla según donde guardes tu archivo de audio)
      const audioFilePath = path.resolve(__dirname, "assets", "audio", "audio.mp3");

      // Generar el video usando ffmpeg
      const videoFilePath = path.resolve(tempFolder, `${userJid}_video.mp4`);

      ffmpeg()
        .input(imageFilePath)
        .loop(10) // Loops the image for 10 seconds
        .input(audioFilePath)
        .audioCodec("aac")
        .videoCodec("libx264")
        .outputOptions(["-t 10", "-vf fade=t=in:st=0:d=1", "-preset fast"]) // Aparece gradualmente
        .output(videoFilePath)
        .on("end", async () => {
          try {
            // Enviar el video al chat
            await socket.sendMessage(remoteJid, {
              video: fs.createReadStream(videoFilePath),
              caption: `Aquí está tu mini video, @${userJid.split("@")[0]}`,
              mentions: [userJid],
            });

            // Limpiar archivos temporales
            fs.unlinkSync(imageFilePath);
            fs.unlinkSync(videoFilePath);
          } catch (error) {
            console.error("Error al enviar el video:", error);
            await sendReply("Hubo un problema al generar el video.");
          }
        })
        .on("error", (err) => {
          console.error("Error al crear el video:", err);
          sendReply("Hubo un problema al crear el video.");
        })
        .run();
    } catch (error) {
      console.error("Error general:", error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};