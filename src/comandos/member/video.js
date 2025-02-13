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
      console.log("Se respondió a un mensaje, usuario JID: ", userJid);
    } else if (args.length < 1) {
      console.log("Uso incorrecto detectado.");
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}perfilvideo @usuario`);
      return;
    } else {
      userJid = args[0].replace("@", "") + "@s.whatsapp.net";
      console.log("Se obtuvo el JID del usuario: ", userJid);
    }

    try {
      console.log("Obteniendo la foto de perfil...");
      let profilePicUrl;
      try {
        profilePicUrl = await socket.profilePictureUrl(userJid, "image");
      } catch (err) {
        console.error("Error al obtener la foto de perfil:", err);
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
        return;
      }

      if (!profilePicUrl) {
        console.log("No se encontró foto de perfil.");
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
        return;
      }

      const tempFolder = path.resolve(__dirname, "../../../assets/temp");
      if (!fs.existsSync(tempFolder)) {
        console.log("Carpeta temp no existe, creándola...");
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      const sanitizedJid = userJid.replace(/[^a-zA-Z0-9_-]/g, "_");
      const imageFilePath = path.join(tempFolder, `${sanitizedJid}_profile.jpg`);
      const outputVideoPath = path.join(tempFolder, `${sanitizedJid}_profile_fade.mp4`);
      const pngImagePath = path.resolve(__dirname, "../../../assets/images/celda2.png");

      console.log("Descargando la imagen de perfil...");
      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      console.log("Generando el video con ffmpeg...");

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(imageFilePath)
          .input(pngImagePath)
          .complexFilter([
            "[1:v]format=rgba,colorchannelmixer=alpha=0[fadein];",  // Iniciar con PNG transparente
            "[fadein]fade=t=in:st=0:d=3[fade];",  // PNG aparece en 3 segundos
            "[0:v][fade]overlay=0:0:enable='between(t,0,10)'",  // Superponer PNG durante 10s
          ])
          .output(outputVideoPath)
          .duration(10)
          .on("end", async () => {
            console.log("Video generado correctamente, enviándolo...");
            try {
              await socket.sendMessage(remoteJid, {
                video: { url: outputVideoPath },
                caption: `Aquí tienes un video donde la imagen de @${userJid.split("@")[0]} se combina con el PNG.`,
              });
              console.log("Video enviado correctamente.");
              resolve();
            } catch (error) {
              console.error("Error al enviar el video:", error);
              await sendReply("⚠️ Ocurrió un error al enviar el video.");
              resolve();
            }
          })
          .on("error", (err) => {
            console.error("FFmpeg Error:", err);
            sendReply("Hubo un problema al generar el video.");
            reject(err);
          })
          .run();
      });
    } catch (error) {
      console.error("Error general:", error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};
