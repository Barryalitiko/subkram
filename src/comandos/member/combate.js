const { PREFIX } = require("../../krampus");

module.exports = {
  name: "combate",
  description: "Inicia una pelea automática entre dos jugadores",
  commands: ["pelea"],
  usage: `${PREFIX}pelea [@usuario]`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    let usuario1 = webMessage.key.participant;
    let mencionados = webMessage.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let usuario2 = mencionados.length > 0 ? mencionados[0] : null;
    
    if (!usuario2) return sendReply("⚠️ Debes mencionar a alguien para pelear.");
    if (usuario1 === usuario2) return sendReply("⚠️ No puedes pelear contra ti mismo.");
    
    // Datos de razas
    const razas = {
      dragon: { HP: 120, mpVel: 4, amVel: 3 },
      caballero: { HP: 140, mpVel: 2, amVel: 2 },
      mago: { HP: 100, mpVel: 5, amVel: 5 },
      hada: { HP: 90, mpVel: 6, amVel: 4 },
      demonio: { HP: 110, mpVel: 3, amVel: 6 },
      elfo: { HP: 105, mpVel: 4, amVel: 5 },
      angel: { HP: 115, mpVel: 3, amVel: 4 }
    };
    
    // Asignar razas aleatorias a los jugadores si no tienen
    let razaUsuario1 = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
    let razaUsuario2 = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
    
    let stats = {
      [usuario1]: { HP: razas[razaUsuario1].HP, MP: 0, AM: 0, raza: razaUsuario1 },
      [usuario2]: { HP: razas[razaUsuario2].HP, MP: 0, AM: 0, raza: razaUsuario2 }
    };
    
    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.max(0, Math.round((value / 100) * max));
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };
    
    // Mensaje inicial
    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️\n\n` +
      `👤 @${usuario1.split("@")[0]} (${stats[usuario1].raza}) vs 👤 @${usuario2.split("@")[0]} (${stats[usuario2].raza})\n\n` +
      `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n` +
      `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
      `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n` +
      `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
      `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n` +
      `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
      `⏳ *La batalla ha comenzado...*`, { mentions: [usuario1, usuario2] }
    );
    
    while (stats[usuario1].HP > 0 && stats[usuario2].HP > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;
      
      let dano = Math.floor(Math.random() * 20) + 10;
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);
      stats[atacante].MP = Math.min(100, stats[atacante].MP + razas[stats[atacante].raza].mpVel);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + razas[stats[atacante].raza].amVel);
      
      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️\n\n` +
          `👤 @${usuario1.split("@")[0]} (${stats[usuario1].raza}) vs 👤 @${usuario2.split("@")[0]} (${stats[usuario2].raza})\n\n` +
          `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n` +
          `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
          `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n` +
          `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
          `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n` +
          `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
          `⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!*\n\n` +
          `⏳ *Siguiente movimiento...*`,
        mentions: [usuario1, usuario2]
      });
    }
    
    let ganador = stats[usuario1].HP > 0 ? usuario1 : usuario2;
    await socket.sendMessage(remoteJid, {
      edit: sentMessage.key,
      text: `⚔️ *¡Batalla finalizada!* ⚔️\n\n` +
        `🏆 *GANADOR:* @${ganador.split("@")[0]} con ${stats[ganador].HP}% de vida restante!`,
      mentions: [usuario1, usuario2]
    });
  },
};
