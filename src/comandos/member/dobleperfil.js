const { PREFIX } = require("../../krampus");

module.exports = {
  name: "profilepic",
  description: "Obtén la foto de perfil de un usuario.",
  commands: ["perfil", "pfp2"],
  usage: `${PREFIX}profilepic @usuario1 @usuario2`,
  handle: async ({ args, socket, remoteJid, sendReply, sendReact, mentionedJid }) => {
    if (mentionedJid.length < 1 || mentionedJid.length > 2) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}pfp @usuario1 @usuario2`);
      return;
    }

    try {
      for (const userJid of mentionedJid) {
        // Obtener la foto de perfil del usuario
        const profilePicUrl = await socket.profilePictureUrl(userJid, "image");
        if (profilePicUrl) {
          await sendReply(`> Krampus Bot👻 procesando...`);
          await sendReact("📸");
          await socket.sendMessage(remoteJid, {
            image: { url: profilePicUrl },
            caption: `Foto de perfil cargada...`,
          });
        } else {
          await sendReply(`No se pudo obtener la foto de perfil de @${userJid.split("@")[0]}.`);
        }
      }
    } catch (error) {
      console.error("Error al obtener la foto de perfil:", error);
      await sendReply("No tiene foto de perfil o es inaccesible.");
    }
  },
};
