const { PREFIX } = require("../../krampus");

// Definimos las razas y sus características equilibradas
const razas = {
  dragon: { HP: 120, velocidadMP: 12, velocidadAM: 10 },
  caballero: { HP: 140, velocidadMP: 8, velocidadAM: 7 },
  mago: { HP: 100, velocidadMP: 15, velocidadAM: 15 },
  hada: { HP: 90, velocidadMP: 18, velocidadAM: 12 },
  demonio: { HP: 110, velocidadMP: 14, velocidadAM: 14 },
  elfo: { HP: 105, velocidadMP: 16, velocidadAM: 13 },
  angel: { HP: 115, velocidadMP: 13, velocidadAM: 11 }
};

const usuariosRazas = {}; // Almacena la raza asignada permanentemente

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

    // Asignar raza si no tiene
    if (!usuariosRazas[usuario1]) {
      usuariosRazas[usuario1] = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
    }
    if (!usuariosRazas[usuario2]) {
      usuariosRazas[usuario2] = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
    }
    
    let stats = {
      [usuario1]: { HP: razas[usuariosRazas[usuario1]].HP, MP: 0, AM: 0 },
      [usuario2]: { HP: razas[usuariosRazas[usuario2]].HP, MP: 0, AM: 0 }
    };

    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.round((value / 100) * max);
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };

    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️\n\n` +
      `👤 @${usuario1.split("@")[0]} (${usuariosRazas[usuario1]}) vs 👤 @${usuario2.split("@")[0]} (${usuariosRazas[usuario2]})\n\n` +
      `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n` +
      `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
      `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n` +
      `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
      `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n` +
      `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
      `⏳ *Batalla en progreso...*`, { mentions: [usuario1, usuario2] }
    );
    
    while (stats[usuario1].HP > 0 && stats[usuario2].HP > 0) {
      await new Promise(resolve => setTimeout(resolve, 4000));
      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;

      let dano = Math.floor(Math.random() * 20) + 10;
      let razaAtacante = usuariosRazas[atacante];
      let mpGanado = razas[razaAtacante].velocidadMP;
      let amGanado = razas[razaAtacante].velocidadAM;
      
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);
      stats[atacante].MP = Math.min(100, stats[atacante].MP + mpGanado);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + amGanado);

      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️\n\n` +
          `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n` +
          `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
          `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n` +
          `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
          `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n` +
          `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
          `⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!\n` +
          `⚡ ¡Ganó ${mpGanado}% de MP y ${amGanado}% de Ataque Mágico!\n\n` +
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
  }
};
