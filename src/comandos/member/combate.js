const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

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

    const razasPath = path.resolve(process.cwd(), "assets/razas.json");
    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");
    let razas = JSON.parse(fs.readFileSync(razasPath, "utf8"));
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};

    const obtenerRaza = (usuario) => {
      if (!jugadores[usuario]) {
        let razaAleatoria = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
        jugadores[usuario] = { raza: razaAleatoria, HP: razas[razaAleatoria].HP, MP: 0, AM: 0 };
        fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));
        return razaAleatoria;
      }
      return jugadores[usuario].raza;
    };

    let raza1 = obtenerRaza(usuario1);
    let raza2 = obtenerRaza(usuario2);

    let stats = {
      [usuario1]: jugadores[usuario1],
      [usuario2]: jugadores[usuario2]
    };

    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.max(0, Math.min(max, Math.round((value / razas[stats[usuario1].raza].HP) * max)));
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };

    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️\n👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})\n\n💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP})\n${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP})\n\n✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM})\n${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM})\n\n⏳ *Batalla en curso...*`, { mentions: [usuario1, usuario2] });

    const combateInterval = setInterval(async () => {
      if (stats[usuario1].HP <= 0 || stats[usuario2].HP <= 0) {
        clearInterval(combateInterval);
        let ganador = stats[usuario1].HP > 0 ? usuario1 : usuario2;
        fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));
        await socket.sendMessage(remoteJid, {
          edit: sentMessage.key,
          text: `⚔️ *¡Batalla finalizada!* ⚔️\n🏆 *GANADOR:* @${ganador.split("@")[0]} con ${stats[ganador].HP} de vida restante!`,
          mentions: [usuario1, usuario2]
        });
        return;
      }

      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;

      let ataque = stats[atacante].AM >= 100 ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 20) + 10;
      stats[defensor].HP = Math.max(0, stats[defensor].HP - ataque);
      stats[atacante].AM = stats[atacante].AM >= 100 ? 0 : Math.min(100, stats[atacante].AM + razas[stats[atacante].raza]?.AM_carga || 0);

      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️\n👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})\n\n💥 HP:\n${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP})\n${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP})\n\n✨ Ataque Mágico:\n${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM})\n${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM})\n\n⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${ataque} de daño!*`,
        mentions: [usuario1, usuario2]
      });
    }, 3000);
  },
};
