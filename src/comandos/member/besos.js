const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const gifs = require("../../assets/gifs.json");  // Importamos el archivo gifs.json

module.exports = {
  name: "beso",
  description: "Envía un beso con un gif y etiqueta a alguien.",
  commands: ["beso"],
  usage: `${PREFIX}beso [@usuario]`,
  handle: async ({ args, remoteJid, reply, socket, message, sendReply, sendReact }) => {
    try {
      let gif = gifs.besos[Math.floor(Math.random() * gifs.besos.length)]; // Seleccionamos un gif aleatorio de la categoría "besos"
      
      let mentions = [];
      let caption = "💋 ¡Un beso para ti!";
      
      // Si es una respuesta, etiquetamos al autor del mensaje
      if (message.extendedTextMessage && message.extendedTextMessage.contextInfo) {
        const mentionedUser = message.extendedTextMessage.contextInfo.participant;
        mentions.push(mentionedUser);
        caption = `💋 ¡Un beso para @${mentionedUser.split('@')[0]}!`;
      } 
      // Si se etiqueta a alguien
      else if (args.length > 0) {
        const userToTag = args[0].replace("@", "") + "@s.whatsapp.net";  // Extraemos el JID del usuario etiquetado
        mentions.push(userToTag);
        caption = `💋 ¡Un beso para @${args[0].replace("@", "")}!`;
      } 
      // Si no se etiqueta a nadie, seleccionamos aleatoriamente un miembro del grupo
      else {
        const groupParticipants = await socket.groupMetadata(remoteJid);
        const randomUser = groupParticipants.participants[Math.floor(Math.random() * groupParticipants.participants.length)].id;
        mentions.push(randomUser);
        caption = `💋 ¡Un beso para @${randomUser.split('@')[0]}!`;
      }

      // Enviamos el mensaje con el gif y la etiqueta
      await socket.sendMessage(remoteJid, {
        image: { url: gif },
        caption: caption,
        mentions: mentions,
      });

    } catch (error) {
      console.error("Error al procesar el comando 'beso':", error);
      await sendReply("❌ Hubo un problema al procesar tu beso.");
    }
  },
};