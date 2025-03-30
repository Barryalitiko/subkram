const { PREFIX } = require("../../krampus");

module.exports = {
  name: "combate",
  description: "Inicia una pelea automática entre dos jugadores",
  commands: ["pelea"],
  usage: `${PREFIX}pelea [@usuario]`,
  handle: async ({ sendReply, socket, remoteJid, webMessage, db }) => {
    if (!db || typeof db.get !== "function" || typeof db.set !== "function") {
      return sendReply("⚠️ Error: No se pudo acceder a la base de datos.");
    }

    let usuario1 = webMessage.key.participant;
    let mencionados = webMessage.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let usuario2 = mencionados.length > 0 ? mencionados[0] : null;
    
    if (!usuario2) return sendReply("⚠️ Debes mencionar a alguien para pelear.");
    if (usuario1 === usuario2) return sendReply("⚠️ No puedes pelear contra ti mismo.");
    
    // Definir razas
    const razas = {
      Dragon: { HP: 120, MP_carga: 8, AM_carga: 5 },
      Caballero: { HP: 150, MP_carga: 5, AM_carga: 6 },
      Mago: { HP: 100, MP_carga: 12, AM_carga: 8 },
      Hada: { HP: 90, MP_carga: 15, AM_carga: 10 },
      Demonio: { HP: 110, MP_carga: 10, AM_carga: 12 },
      Elfo: { HP: 95, MP_carga: 14, AM_carga: 9 },
      Angel: { HP: 130, MP_carga: 7, AM_carga: 7 }
    };
    
    const obtenerRaza = async (usuario) => {
      let datos = await db?.get(`raza_${usuario}`).catch(() => null);
      if (!datos) {
        let razaAleatoria = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
        await db?.set(`raza_${usuario}`, razaAleatoria).catch(() => null);
        return razaAleatoria;
      }
      return datos;
    };
    
    let raza1 = await obtenerRaza(usuario1);
    let raza2 = await obtenerRaza(usuario2);
    
    let stats = {
      [usuario1]: { HP: razas[raza1].HP, MP: 0, AM: 0 },
      [usuario2]: { HP: razas[raza2].HP, MP: 0, AM: 0 }
    };
    
    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.max(0, Math.round((value / 100) * max));
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };
    
    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️\n👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})\n\n` +
      `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
      `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
      `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n⏳ *Batalla en curso...*`, { mentions: [usuario1, usuario2] }
    );
    
    while (stats[usuario1].HP > 0 && stats[usuario2].HP > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;
      
      let dano = Math.floor(Math.random() * 20) + 10;
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);
      stats[atacante].MP = Math.min(100, stats[atacante].MP + razas[await obtenerRaza(atacante)].MP_carga);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + razas[await obtenerRaza(atacante)].AM_carga);
      
      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️\n👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})\n\n` +
          `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
          `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
          `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
          `⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!*`,
        mentions: [usuario1, usuario2]
      });
    }
    
    let ganador = stats[usuario1].HP > 0 ? usuario1 : usuario2;
    await socket.sendMessage(remoteJid, {
      edit: sentMessage.key,
      text: `⚔️ *¡Batalla finalizada!* ⚔️\n🏆 *GANADOR:* @${ganador.split("@")[0]} con ${stats[ganador].HP}% de vida restante!`,
      mentions: [usuario1, usuario2]
    });
  },
};
