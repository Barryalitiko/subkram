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

      // Carpeta temporal segura
      const tempFolder = path.resolve(__dirname, "../../../assets/temp");
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      // Sanitizar nombre del archivo
      const sanitizedJid = userJid.replace(/[^a-zA-Z0-9_-]/g, "_");
      const imageFilePath = path.join(tempFolder, `${sanitizedJid}_profile.jpg`);
      const outputImagePath = path.join(tempFolder, `${sanitizedJid}_profile_with_png.jpg`);
      const pngImagePath = path.resolve(__dirname, "../../../assets/images/celda.png");

      // Descargar la foto de perfil
      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      // Verificar que los archivos existen
      if (!fs.existsSync(imageFilePath)) {
        await sendReply("No se pudo guardar la imagen de perfil.");
        return;
      }
      if (!fs.existsSync(pngImagePath)) {
        await sendReply("El archivo PNG no existe.");
        return;
      }

      // Ajustar el tamaño del PNG al de la imagen de perfil
      ffmpeg()
        .input(imageFilePath)
        .input(pngImagePath)
        .complexFilter([
          "[0:v]scale=500:500[bg];", // Redimensionar la imagen de perfil a 500x500
          "[1:v]scale=500:500[overlay];", // Redimensionar el PNG al mismo tamaño
          "[bg][overlay]overlay=0:0[out]" // Superponer el PNG encima de la imagen de perfil
        ])
        .map("[out]") // Usar la salida correcta
        .save(outputImagePath)
        .on("end", async () => {
          try {
            // Enviar la imagen editada
            await socket.sendMessage(remoteJid, {
              image: { url: outputImagePath },
              caption: `Aquí tienes la foto de perfil de @${userJid.split("@")[0]} con el PNG encima.`,
            });

            // Limpiar archivos temporales
            fs.unlinkSync(imageFilePath);
            fs.unlinkSync(outputImagePath);
          } catch (error) {
            console.error(error);
            await sendReply("⚠️ Ocurrió un error inesperado, pero la imagen se envió correctamente.");
          }
        })
        .on("error", (err) => {
          console.error("FFmpeg Error:", err);
          sendReply("Hubo un problema al procesar la imagen.");
        })
        .run();
    } catch (error) {
      console.error(error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};
