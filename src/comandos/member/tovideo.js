const { PREFIX } = require("../../krampus");

module.exports = {
  name: "reenviar-audio",
  description: "Reenvía el audio al que se reacciona",
  commands: ["reenviar-audio"],
  usage: `${PREFIX}reenviar-audio`,
  handle: async ({
    args,
    socket,
    remoteJid,
    sendReply,
    sendReact,
    isReply,
    replyJid,
    senderJid,
    isAudio, // Agregamos la función isAudio
  }) => {
    console.log("Comando reenviar-audio ejecutado");

    if (!isReply) {
      console.log("No se está respondiendo a un mensaje");
      await sendReply("Debes responder a un mensaje de audio para reenviarlo");
      return;
    }

    console.log("Se está respondiendo a un mensaje");

    if (!isAudio(replyJid)) { // Verificamos si el mensaje es un audio
      console.log("El mensaje no es un audio");
      await sendReply("Debes responder a un mensaje de audio para reenviarlo");
      return;
    }

    try {
      const media = await socket.downloadMediaMessage(replyJid);
      console.log("Media descargada:", media);
      await socket.sendMessage(remoteJid, {
        audio: { url: media.path },
        caption: "Audio reenviado",
      });
      console.log("Audio reenviado con éxito");
    } catch (error) {
      console.error("Error al reenviar audio:", error);
      await sendReply("Hubo un error al reenviar el audio");
    }
  },
};
