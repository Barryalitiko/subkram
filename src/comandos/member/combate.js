const { PREFIX } = require("../../krampus");

module.exports = {
  name: "combate",
  description: "Inicia una pelea automática entre dos jugadores",
  commands: ["pelea"],
  usage: `${PREFIX}pelea [@usuario]`,
  handle: async ({ sendReply, socket, remoteJid, webMessage, db }) => {
    let usuario1 = webMessage.key.participant;
    let mencionados = webMessage.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let usuario2 = mencionados.length > 0 ? mencionados[0] : null;
    
    if (!usuario2) return sendReply("⚠️ Debes mencionar a alguien para pelear.");
    if (usuario1 === usuario2) return sendReply("⚠️ No puedes pelear contra ti mismo.");
    
    const razas = {
      "Dragón": { HP: 120, MP_vel: 7, AM_vel: 5 },
      "Caballero": { HP: 150, MP_vel: 5, AM_vel: 4 },
      "Mago": { HP: 100, MP_vel: 10, AM_vel: 8 },
      "Hada": { HP: 90, MP_vel: 12, AM_vel: 9 },
      "Demonio": { HP: 110, MP_vel: 8, AM_vel: 7 },
      "Elfo": { HP: 100, MP_vel: 9, AM_vel: 6 },
      "Ángel": { HP: 130, MP_vel: 6, AM_vel: 5 }
    };
    
    let obtenerRaza = (usuario) => {
      let razaAsignada = db.get(`raza_${usuario}`);
      if (!razaAsignada) {
        let razasDisponibles = Object.keys(razas);
        razaAsignada = razasDisponibles[Math.floor(Math.random() * razasDisponibles.length)];
        db.set(`raza_${usuario}`, razaAsignada);
      }
      return razaAsignada;
    };
    
    let raza1 = obtenerRaza(usuario1);
    let raza2 = obtenerRaza(usuario2);
    
    let stats = {
      [usuario1]: { HP: razas[raza1].HP, MP: 0, AM: 0, MP_vel: razas[raza1].MP_vel, AM_vel: razas[raza1].AM_vel },
      [usuario2]: { HP: razas[raza2].HP, MP: 0, AM: 0, MP_vel: razas[raza2].MP_vel, AM_vel: razas[raza2].AM_vel }
    };
    
    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.max(0, Math.min(max, Math.round((value / 100) * max)));
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };
    
    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️

` +
      `👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})

` +
      `💥 HP:
${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)
` +
      `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)

` +
      `⚡ MP:
${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)
` +
      `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)

` +
      `✨ Ataque Mágico:
${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)
` +
      `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)

` +
      `⏳ *Combate en curso...*`, { mentions: [usuario1, usuario2] }
    );
    
    while (stats[usuario1].HP > 0 && stats[usuario2].HP > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;
      
      let dano = Math.floor(Math.random() * 20) + 10;
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);
      stats[atacante].MP = Math.min(100, stats[atacante].MP + stats[atacante].MP_vel);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + stats[atacante].AM_vel);
      
      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️

` +
          `👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})

` +
          `💥 HP:
${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)
` +
          `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)

` +
          `⚡ MP:
${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)
` +
          `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)

` +
          `✨ Ataque Mágico:
${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)
` +
          `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)

` +
          `⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!*`,
        mentions: [usuario1, usuario2]
      });
    }
    
    let ganador = stats[usuario1].HP > 0 ? usuario1 : usuario2;
    await socket.sendMessage(remoteJid, {
      edit: sentMessage.key,
      text: `⚔️ *¡Batalla finalizada!* ⚔️

` +
        `🏆 *GANADOR:* @${ganador.split("@")[0]} con ${stats[ganador].HP}% de vida restante!`,
      mentions: [usuario1, usuario2]
    });
  },
};
