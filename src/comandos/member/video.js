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
      console.log("Se respondió a un mensaje, usuario JID: ", userJid);
    } else if (args.length < 1) {
      console.log("Uso incorrecto detectado.");
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}perfilpng @usuario`);
      return;
    } else {
      userJid = args[0].replace("@", "") + "@s.whatsapp.net";
      console.log("Se obtuvo el JID del usuario: ", userJid);
    }

    try {
      let profilePicUrl;
      try {
        console.log("Obteniendo la foto de perfil...");
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
      const outputImagePath = path.join(tempFolder, `${sanitizedJid}_profile_with_png.jpg`);
      const pngImagePath = path.resolve(__dirname, "../../../assets/images/celda2.png");

      console.log("Descargando la imagen de perfil...");
      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      console.log("Procesando la imagen con ffmpeg...");
      
      let isProcessed = false; // Variable de control para evitar el envío duplicado

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(imageFilePath)
          .input(pngImagePath)
          .complexFilter([
            "[1:v]scale=iw:ih[scaled_png]",
            "[0:v][scaled_png]overlay=0:0"
          ])
          .save(outputImagePath)
          .on("end", async () => {
            if (isProcessed) {
              console.log("La imagen ya fue procesada y enviada anteriormente. Ignorando el envío.");
              return;
            }
            console.log("Proceso de ffmpeg finalizado, enviando la imagen procesada...");
            try {
              // Enviar la imagen procesada
              await socket.sendMessage(remoteJid, {
                image: { url: outputImagePath },
                caption: `Aquí tienes la foto de perfil de @${userJid.split("@")[0]} con el PNG encima.`,
              });
              console.log("Imagen procesada enviada correctamente.");
              isProcessed = true; // Marcamos que la imagen fue procesada y enviada
              resolve(); // Resolvemos la promesa cuando se envía la imagen procesada
            } catch (error) {
              console.error("Error al enviar la imagen procesada:", error);
              await sendReply("⚠️ Ocurrió un error inesperado, pero la imagen se envió correctamente.");
              isProcessed = true; // Marcamos que la imagen fue procesada y enviada
              resolve(); // Resolvemos la promesa incluso si hubo un error
            }
          })
          .on("error", (err) => {
            console.error("FFmpeg Error:", err);
            sendReply("Hubo un problema al procesar la imagen.");
            reject(err); // Rechazamos la promesa si hay error
          })
          .run();
      });
    } catch (error) {
      console.error("Error general:", error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};
