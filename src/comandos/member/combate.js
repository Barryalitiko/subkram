const { PREFIX } = require("../../krampus");

const razas = {
  dragón: { HP: 120, MP: 50, AM: 30 },
  caballero: { HP: 110, MP: 40, AM: 20 },
  mago: { HP: 80, MP: 100, AM: 80 },
  hada: { HP: 90, MP: 60, AM: 40 },
  demonio: { HP: 90, MP: 100, AM: 100 },
  elfo: { HP: 100, MP: 70, AM: 50 },
  angel: { HP: 110, MP: 50, AM: 50 }
};

// Función para asignar una raza aleatoria
function asignarRaza() {
  const razasDisponibles = Object.keys(razas);
  const razaElegida = razasDisponibles[Math.floor(Math.random() * razasDisponibles.length)];
  return razaElegida;
}

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
    
    // Asignar una raza aleatoria a los usuarios
    let razaUsuario1 = asignarRaza();
    let razaUsuario2 = asignarRaza();
    
    // Datos de pelea basados en las razas
    let stats = {
      [usuario1]: { ...razas[razaUsuario1] },
      [usuario2]: { ...razas[razaUsuario2] }
    };
    
    // Función para crear las barras
    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.round((value / 100) * max);
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };
    
    // Mensaje inicial
    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️\n\n` +
      `👤 @${usuario1.split("@")[0]} (Raza: ${razaUsuario1}) vs 👤 @${usuario2.split("@")[0]} (Raza: ${razaUsuario2})\n\n` +
      `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n` +
      `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
      `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n` +
      `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
      `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n` +
      `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
      `⏳ *Turno en progreso...*`, { mentions: [usuario1, usuario2] }
    );
    
    let turnos = 5; // Cantidad de turnos antes de finalizar la pelea
    
    for (let i = 0; i < turnos; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula tiempo entre turnos
      
      let atacante = i % 2 === 0 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;
      
      let dano = Math.floor(Math.random() * 20) + 10;
      let mpGanado = Math.floor(Math.random() * 15) + 5;
      let amGanado = Math.floor(Math.random() * 20) + 10;
      
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);
      stats[atacante].MP = Math.min(100, stats[atacante].MP + mpGanado);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + amGanado);
      
      if (stats[defensor].HP === 0) {
        await socket.sendMessage(remoteJid, {
          edit: sentMessage.key,
          text: `⚔️ *¡Batalla terminada!* ⚔️\n\n` +
            `👤 @${atacante.split("@")[0]} ha derrotado a 👤 @${defensor.split("@")[0]}\n\n` +
            `🏆 *GANADOR:* @${atacante.split("@")[0]}`,
          mentions: [usuario1, usuario2]
        });
        return;
      }
      
      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️\n\n` +
          `👤 @${usuario1.split("@")[0]} (Raza: ${razaUsuario1}) vs 👤 @${usuario2.split("@")[0]} (Raza: ${razaUsuario2})\n\n` +
          `💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)\n` +
          `${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)\n\n` +
          `⚡ MP:\n${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)\n` +
          `${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
          `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)\n` +
          `${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
          `⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!*\n` +
          `⚡ ¡Ganó ${mpGanado}% de MP y ${amGanado}% de Ataque Mágico!\n\n` +
          `⏳ *Siguiente turno...*`,
        mentions: [usuario1, usuario2]
      });
    }
    
    let ganador = stats[usuario1].HP > stats[usuario2].HP ? usuario1 : usuario2;
    await socket.sendMessage(remoteJid, {
      edit: sentMessage.key,
      text: `⚔️ *¡Batalla finalizada!* ⚔️\n\n` +
        `🏆 *GANADOR:* @${ganador.split("@")[0]} con ${stats[ganador].HP}% de vida restante!`,
      mentions: [usuario1, usuario2]
    });
  },
};
