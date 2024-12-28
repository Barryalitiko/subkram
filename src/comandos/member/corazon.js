const { PREFIX } = require("../../krampus");
const Canvas = require("canvas");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch"); // Para descargar imágenes desde URLs

module.exports = {
  name: "profileheart",
  description: "Añade un corazón a la foto de perfil de un usuario.",
  commands: ["pfpheart", "corazonpfp"],
  usage: `${PREFIX}profileheart @usuario`,
  handle: async ({ args, socket, remoteJid, sendReply, sendReact }) => {
    if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}pfpheart @usuario`);
      return;
    }

    const userJid = args[0].replace("@", "") + "@s.whatsapp.net";

    try {
      // Obtener la foto de perfil del usuario
      const profilePicUrl = await socket.profilePictureUrl(userJid, "image");

      if (!profilePicUrl) {
        await sendReact("❌");
        return await sendReply(`No se pudo obtener la foto de perfil de @${args[0]}.`);
      }

      await sendReply("> Krampus Bot👻 procesando...");
      await sendReact("⏳");

      // Descargar la foto de perfil
      const response = await fetch(profilePicUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Cargar la imagen de perfil y crear el lienzo
      const avatar = await Canvas.loadImage(buffer);
      const canvas = Canvas.createCanvas(avatar.width, avatar.height);
      const ctx = canvas.getContext("2d");

      // Dibujar la foto de perfil en el lienzo
      ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

      // Añadir el corazón al centro
      const heartImagePath = path.resolve(__dirname, "../../assets/heart.png"); // Ruta de la imagen del corazón
      const heartImage = await Canvas.loadImage(heartImagePath);
      const heartSize = canvas.width * 0.2; // Tamaño del corazón (20% del ancho)
      const heartX = (canvas.width - heartSize) / 2;
      const heartY = (canvas.height - heartSize) / 2;
      ctx.drawImage(heartImage, heartX, heartY, heartSize, heartSize);

      // Convertir el lienzo a un Buffer
      const outputBuffer = canvas.toBuffer("image/jpeg");

      // Enviar la imagen generada al chat
      await socket.sendMessage(remoteJid, {
        image: outputBuffer,
        caption: "Aquí está la foto de perfil con un corazón 💖",
      });

      await sendReact("✅");
    } catch (error) {
      console.error("Error al procesar la foto de perfil:", error);
      await sendReact("❌");
      await sendReply("Hubo un error al procesar la imagen. Inténtalo nuevamente.");
    }
  },
};