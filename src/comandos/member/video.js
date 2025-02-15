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
handle: async ({
args,
socket,
remoteJid,
sendReply,
isReply,
replyJid,
senderJid,
}) => {
console.log("Iniciando comando perfilVideo");

let userJid;
if (isReply) {
  userJid = replyJid;
} else if (args.length < 1) {
  console.log("Uso incorrecto del comando");
  await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}perfilvideo @usuario`);
  return;
} else {
  userJid = args[0].replace("@", "") + "@s.whatsapp.net";
}

console.log(`Usuario: ${userJid}`);

try {
  let profilePicUrl;
  try {
    profilePicUrl = await socket.profilePictureUrl(userJid, "image");
    console.log(`Foto de perfil: ${profilePicUrl}`);
  } catch (err) {
    console.error(`Error al obtener foto de perfil: ${err}`);
    await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
    return;
  }

  if (!profilePicUrl) {
    console.log("No se encontró foto de perfil");
    await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
    return;
  }

  const tempFolder = path.resolve(__dirname, "../../../assets/temp");
  console.log(`Carpeta temporal: ${tempFolder}`);

  if (!fs.existsSync(tempFolder)) {
    console.log("Creando carpeta temporal");
    fs.mkdirSync(tempFolder, { recursive: true });
  }

  const sanitizedJid = userJid.replace(/[^a-zA-Z0-9_-]/g, "_");
  const imageFilePath = path.join(tempFolder, `${sanitizedJid}_profile.jpg`);
  const outputVideoPath = path.join(tempFolder, `${sanitizedJid}_fade.mp4`);
  const pngImagePath = path.resolve(__dirname, "../../../assets/images/celda2.png");
  const audioFilePath = path.resolve(__dirname, "../../../assets/audio/audio.mp3");

  console.log(`Rutas de archivos:
    - Foto de perfil: ${imageFilePath}
    - Video de salida: ${outputVideoPath}
    - Imagen PNG: ${pngImagePath}
    - Audio: ${audioFilePath}
  `);

  const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
  console.log("Descargando foto de perfil");
  fs.writeFileSync(imageFilePath, response.data);

  await new Promise((resolve, reject) => {
    console.log("Iniciando proceso de ffmpeg");
    ffmpeg()
      .input(imageFilePath)
      .loop(10)
      .input(pngImagePath)
      .loop(10)
      .complexFilter([
        "[1:v]format=rgba,fade=t=in:st=1:d=3[fade]",
        "[0:v][fade]overlay=0:0[final]",
      ])
      .map("[final]")
      .output(outputVideoPath)
      .duration(10)
      .on("end", async () => {
        console.log("Proceso de ffmpeg finalizado");

        // Añadir música al vídeo
        const videoWithAudioPath = path.join(tempFolder, `${sanitizedJid}_video.mp4`);
        ffmpeg()
          .input(outputVideoPath)
          .input(audioFilePath)
          .audioCodec("aac")
          .outputOptions(["-t 10", "-preset fast"])
          .output(videoWithAudioPath)
          .on("end", async () => {
            console.log("Video con música creado");
            await socket.sendMessage(remoteJid, {
              video: { url: videoWithAudioPath },
              caption: `Aquí tienes un video donde la imagen de @${userJid.split("@")[0]} se combina con el PNG.`,
            });
            resolve();
          })
          .on("error", (err) => {
            console.error(`Error al agregar música: ${err}`);
            sendReply("Hubo un problema al generar el video.");
            reject(err);
          })
          .run();
      })
      .on("error", (err) => {
        console.error(`Error en proceso de ffmpeg: ${err}`);
        sendReply("Hubo un problema al generar el video.");
        reject(err);
      })
      .run();
  });
} catch (error) {
  console.error(`Error en comando perfilVideo: ${error}`);
  await sendReply("Hubo un error al procesar el comando.");
}
},
};

