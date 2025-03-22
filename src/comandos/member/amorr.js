const { PREFIX } = require("../../krampus");

module.exports = {
  name: "amor",
  description: "Encuentra a tu persona ideal ❤️",
  commands: ["amor"],
  usage: `${PREFIX}amor`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    const usuario = webMessage.pushName || "Tú";

    // Enviar el mensaje inicial
    let sentMessage = await sendReply("💘 Buscando a la persona perfecta para ti...");

    // Simulación de carga
    const nivelesCarga = [
      "▰═════════ 10%",
      "▰▰════════ 20%",
      "▰▰▰═══════ 30%",
      "▰▰▰▰══════ 40%",
      "▰▰▰▰▰═════ 50%",
      "▰▰▰▰▰▰════ 60%",
      "▰▰▰▰▰▰▰═══ 70%",
      "▰▰▰▰▰▰▰▰══ 80%",
      "▰▰▰▰▰▰▰▰▰═ 90%",
      "▰▰▰▰▰▰▰▰▰▰ 100%",
    ];

    for (let i = 0; i < nivelesCarga.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `💘 Buscando a la persona perfecta para ti...\n${nivelesCarga[i]}`,
      });
    }

    // Obtener los participantes del grupo
    let groupMetadata = await socket.groupMetadata(remoteJid);
    let participantes = groupMetadata.participants.map(p => p.id).filter(id => id !== webMessage.key.participant);

    if (participantes.length === 0) {
      return sendReply("😔 No hay suficientes personas en el grupo para encontrar tu pareja ideal.");
    }

    // Elegir una persona aleatoria
    let personaIdeal = participantes[Math.floor(Math.random() * participantes.length)];

    // Enviar el mensaje final etiquetando a la persona
    await socket.sendMessage(remoteJid, {
      text: `❤️ ¡Felicidades ${usuario}! Tu pareja ideal es @${personaIdeal.split("@")[0]} 💕`,
      mentions: [webMessage.key.participant, personaIdeal],
    });
  },
};
