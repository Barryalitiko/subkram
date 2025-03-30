const { PREFIX } = require("../../krampus");

// Configuración de razas
const razas = {
  Dragon: { HP: 120, MP_Carga: 12, AM_Carga: 10 },
  Caballero: { HP: 130, MP_Carga: 8, AM_Carga: 12 },
  Mago: { HP: 90, MP_Carga: 15, AM_Carga: 14 },
  Hada: { HP: 100, MP_Carga: 14, AM_Carga: 12 },
  Demonio: { HP: 110, MP_Carga: 13, AM_Carga: 11 },
  Elfo: { HP: 105, MP_Carga: 12, AM_Carga: 13 },
  Angel: { HP: 115, MP_Carga: 10, AM_Carga: 15 }
};

const usuariosRazas = {};

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
    
    // Asignar razas si es la primera vez
    if (!usuariosRazas[usuario1]) {
      usuariosRazas[usuario1] = Object.keys(razas)[Math.floor(Math.random() * 7)];
    }
    if (!usuariosRazas[usuario2]) {
      usuariosRazas[usuario2] = Object.keys(razas)[Math.floor(Math.random() * 7)];
    }

    let raza1 = usuariosRazas[usuario1];
    let raza2 = usuariosRazas[usuario2];

    let stats = {
      [usuario1]: { HP: razas[raza1].HP, MP: 0, AM: 0, MP_Carga: razas[raza1].MP_Carga, AM_Carga: razas[raza1].AM_Carga },
      [usuario2]: { HP: razas[raza2].HP, MP: 0, AM: 0, MP_Carga: razas[raza2].MP_Carga, AM_Carga: razas[raza2].AM_Carga }
    };

    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.max(0, Math.round((value / 100) * max));
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };

    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️\n\n` +
      `👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})\n\n` +
      `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n` +
      `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
      `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n` +
      `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
      `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n` +
      `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
      `⏳ *Batalla en curso...*`, { mentions: [usuario1, usuario2] }
    );

    while (stats[usuario1].HP > 0 && stats[usuario2].HP > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;
      
      let dano = Math.floor(Math.random() * 20) + 10;
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);
      stats[atacante].MP = Math.min(100, stats[atacante].MP + stats[atacante].MP_Carga);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + stats[atacante].AM_Carga);

      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️\n\n` +
          `👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})\n\n` +
          `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n` +
          `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
          `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n` +
          `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
          `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n` +
          `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
          `⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!*\n\n` +
          `⏳ *Siguiente ataque...*`,
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
