const fs = require("fs");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "beso",
  description: "Envía un beso en forma de gif",
  commands: ["beso"],
  usage: `${PREFIX}beso @usuario`,
  handle: async ({ args, remoteJid, sendReply, socket, message }) => {
    // Leer el archivo gifs.json
    const gifs = JSON.parse(fs.readFileSync("./assets/gifs.json", "utf8"));

    // Verificar si la clave 'besos' existe en el JSON
    if (!gifs.besos || gifs.besos.length === 0) {
      await sendReply("❌ No hay gifs de besos disponibles.");
      return;
    }

    // Seleccionar un gif aleatorio de los disponibles
    const gifUrl = gifs.besos[Math.floor(Math.random() * gifs.besos.length)];

    // Verificar si se está respondiendo a un mensaje o mencionando a alguien
    let mentionedUser = message.mentionedJidList[0];

    if (!mentionedUser) {
      // Si no se menciona a nadie, seleccionamos un miembro del grupo de manera aleatoria
      const groupMembers = await socket.groupMetadata(remoteJid);
      const randomMember = groupMembers.participants[Math.floor(Math.random() * groupMembers.participants.length)];
      mentionedUser = randomMember.id;
    }

    // Enviar el gif con la mención
    await socket.sendMessage(remoteJid, {
      image: { url: gifUrl },
      caption: `@${mentionedUser.split("@")[0]} ¡Te envío un beso! 💋`,
      mentions: [mentionedUser],
    });
  },
};