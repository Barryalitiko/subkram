const { PREFIX } = require("../../krampus");
const canvas = require("canvas");
const path = require("path");

module.exports = {
  name: "corazonperfil",
  description: "Añade un corazón en el centro de la foto de perfil.",
  commands: ["corazonperfil"],
  usage: `${PREFIX}corazonperfil @usuario`,
  handle: async ({ args, socket, remoteJid, sendReply, sendReact }) => {
    if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}corazonperfil @usuario`);
      return;
    }

    const userJid = args[0].replace("@", "") + "@s.whatsapp.net";

    try {
      // Obtener la foto de perfil del usuario
      const profilePicUrl = await socket.profilePictureUrl(userJid, "image");

      if (profilePicUrl) {
        // Descargar la foto de perfil
        await sendReact("📸");
        const profilePic = await canvas.loadImage(profilePicUrl);

        // Crear un lienzo con las mismas dimensiones que la foto de perfil
        const canvasWidth = profilePic.width;
        const canvasHeight = profilePic.height;
        const canvasElement = canvas.createCanvas(canvasWidth, canvasHeight);
        const ctx = canvasElement.getContext("2d");

        // Dibujar la foto de perfil en el lienzo
        ctx.drawImage(profilePic, 0, 0, canvasWidth, canvasHeight);

        // Cargar el corazón desde el repositorio
        const heartImage = await canvas.loadImage(path.resolve(__dirname, "../../assets/temp/imagenes/corazon.png"));

        // Calcular el centro de la imagen para posicionar el corazón
        const heartX = (canvasWidth - heartImage.width) / 2;
        const heartY = (canvasHeight - heartImage.height) / 2;

        // Dibujar el corazón en el centro de la foto de perfil
        ctx.drawImage(heartImage, heartX, heartY);

        // Enviar la imagen modificada como respuesta
        const buffer = canvasElement.toBuffer("image/png");

        await socket.sendMessage(remoteJid, {
          image: buffer,
          caption: "Aquí está tu foto de perfil con un corazón en el centro 💖",
        });

        await sendReact("✅");
      } else {
        await sendReply(`No se pudo obtener la foto de perfil de @${args[0]}.`);
      }
    } catch (error) {
      console.error("Error al procesar el comando:", error);
      await sendReply("Hubo un error al procesar la imagen.");
    }
  },
};