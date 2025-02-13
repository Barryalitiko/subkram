const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "perfilConPNG",
  description: "Envía la foto de perfil del usuario con un PNG encima.",
  commands: ["perfilpng", "fotoConPNG"],
  usage: `${PREFIX}perfilpng @usuario`,
  handle: async ({ args, socket, remoteJid, sendReply, isReply, replyJid, senderJid }) => {
    let userJid;
    if (isReply) {
      userJid = replyJid;
    } else if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}perfilpng @usuario`);
      return;
    } else {
      userJid = args[0].replace("@", "") + "@s.whatsapp.net";
    }

    try {
      let profilePicUrl;
      try {
        profilePicUrl = await socket.profilePictureUrl(userJid, "image");
      } catch (err) {
        console.error(err);
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
        return;
      }

      if (!profilePicUrl) {
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
        return;
      }

      // Ruta temporal para guardar los archivos
      const tempFolder = "C:/temp";
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      const sanitizedJid = userJid.replace(/[@.:]/g, "_"); // Reemplazar caracteres especiales
      const imageFilePath = path.resolve(tempFolder, `${sanitizedJid}_profile.jpg`);
      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      const pngImagePath = path.resolve(__dirname, "../../../assets/images/celda.png");
      const outputImagePath = path.resolve(tempFolder, `${sanitizedJid}_profile_with_png.jpg`);

      // Usamos ffmpeg para combinar la foto de perfil con el PNG
      ffmpeg()
        .input(imageFilePath)
        .input(pngImagePath)
        .outputOptions([
          "-vf", "overlay=10:10" // Posicionamos el PNG en la parte superior izquierda
        ])
        .output(outputImagePath)
        .on("end", async () => {
          try {
            // Enviar la imagen combinada
            await socket.sendMessage(remoteJid, {
              image: { url: outputImagePath },
              caption: `Aquí tienes la foto de perfil de @${userJid.split("@")[0]} con el PNG encima.`,
            });

            // Eliminar los archivos temporales
            fs.unlinkSync(imageFilePath);
            fs.unlinkSync(outputImagePath);
          } catch (error) {
            console.error(error);
            await sendReply("Hubo un problema al enviar la imagen.");
          }
        })
        .on("error", (err) => {
          console.error(err);
          sendReply("Hubo un problema al procesar la imagen.");
        })
        .run();
    } catch (error) {
      console.error(error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};
