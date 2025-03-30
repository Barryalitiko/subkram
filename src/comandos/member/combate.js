const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const RAZAS = {
  Dragon: { HP: 130, MP_carga: 6, AM_carga: 10 },
  Caballero: { HP: 150, MP_carga: 5, AM_carga: 5 },
  Mago: { HP: 90, MP_carga: 12, AM_carga: 8 },
  Hada: { HP: 100, MP_carga: 15, AM_carga: 5 },
  Demonio: { HP: 110, MP_carga: 8, AM_carga: 15 },
  Elfo: { HP: 120, MP_carga: 10, AM_carga: 8 },
  Angel: { HP: 110, MP_carga: 8, AM_carga: 8 }
};

const DATA_FILE = path.join(__dirname, "combate_data.json");
let userData = {};
if (fs.existsSync(DATA_FILE)) {
  userData = JSON.parse(fs.readFileSync(DATA_FILE));
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
    
    const asignarRaza = (usuario) => {
      if (!userData[usuario]) {
        let razas = Object.keys(RAZAS);
        let razaAleatoria = razas[Math.floor(Math.random() * razas.length)];
        userData[usuario] = { raza: razaAleatoria };
      }
      return userData[usuario].raza;
    };
    
    let raza1 = asignarRaza(usuario1);
    let raza2 = asignarRaza(usuario2);
    fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
    
    let stats = {
      [usuario1]: { ...RAZAS[raza1], HP_actual: RAZAS[raza1].HP, MP: 0, AM: 0 },
      [usuario2]: { ...RAZAS[raza2], HP_actual: RAZAS[raza2].HP, MP: 0, AM: 0 }
    };
    
    let barras = (value, max, symbol, emptySymbol, length = 10) => {
      let filled = Math.round((value / max) * length);
      return symbol.repeat(filled) + emptySymbol.repeat(length - filled);
    };
    
    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️\n\n` +
      `👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})\n\n` +
      `💥 HP:\n${barras(stats[usuario1].HP_actual, stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP_actual}%)\n` +
      `${barras(stats[usuario2].HP_actual, stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP_actual}%)\n\n` +
      `⚡ MP:\n${barras(stats[usuario1].MP, 100, "●", "○")} (${stats[usuario1].MP}%)\n` +
      `${barras(stats[usuario2].MP, 100, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
      `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, 100, "★", "☆")} (${stats[usuario1].AM}%)\n` +
      `${barras(stats[usuario2].AM, 100, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
      `⏳ *Turno en progreso...*`, { mentions: [usuario1, usuario2] }
    );
    
    let turnos = 5;
    for (let i = 0; i < turnos; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      let atacante = i % 2 === 0 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;
      let dano = Math.floor(Math.random() * 20) + 10;
      
      stats[defensor].HP_actual = Math.max(0, stats[defensor].HP_actual - dano);
      stats[atacante].MP = Math.min(100, stats[atacante].MP + stats[atacante].MP_carga);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + stats[atacante].AM_carga);
      
      if (stats[defensor].HP_actual === 0) {
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
          `👤 @${usuario1.split("@")[0]} vs 👤 @${usuario2.split("@")[0]}\n\n` +
          `💥 HP:\n${barras(stats[usuario1].HP_actual, stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP_actual}%)\n` +
          `${barras(stats[usuario2].HP_actual, stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP_actual}%)\n\n` +
          `⚡ MP:\n${barras(stats[usuario1].MP, 100, "●", "○")} (${stats[usuario1].MP}%)\n` +
          `${barras(stats[usuario2].MP, 100, "●", "○")} (${stats[usuario2].MP}%)\n\n` +
          `✨ Ataque Mágico:\n${barras(stats[usuario1].AM, 100, "★", "☆")} (${stats[usuario1].AM}%)\n` +
          `${barras(stats[usuario2].AM, 100, "★", "☆")} (${stats[usuario2].AM}%)\n\n` +
          `⚔️ @${atacante.split("@")[0]} atacó e hizo *${dano} de daño!*`,
        mentions: [usuario1, usuario2]
      });
    }
  }
};
