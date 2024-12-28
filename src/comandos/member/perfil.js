const { PREFIX } = require("../../config");

module.exports = {
  name: "profilepic",
  description: "Obtén la foto de perfil de un usuario.",
  commands: ["perfil", "pfp"],
  usage: `${PREFIX}profilepic @usuario`,
  handle: async ({ args, socket, remoteJid, sendReply, sendReact }) => {
    if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}pfp @usuario`);
      return;
    }

    const userJid = args[0].replace("@", "") + "@s.whatsapp.net";

    try {
      // Obtener la foto de perfil del usuario
      const profilePicUrl = await socket.profilePictureUrl(userJid, "image");

      if (profilePicUrl) {
        await sendReply(`> Krampus Bot👻
          procesando...`);
        await sendReact("📸");
        await socket.sendMessage(remoteJid, { image: { url: profilePicUrl }, caption: `Foto de perfil cargada...` });
      } else {
        await sendReply(`No se pudo obtener la foto de perfil de @${args[0]}.`);
      }
    } catch (error) {
      console.error("Error al obtener la foto de perfil:", error);
      await sendReply("No tiene foto de perfil o es inaccesible.");
    }
  },
};
