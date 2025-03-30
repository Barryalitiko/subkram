const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs").promises;

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

    // Cargar razas desde el archivo JSON
    const razasPath = path.resolve(process.cwd(), "assets/razas.json");
    let razas = JSON.parse(await fs.readFile(razasPath, "utf8"));

    // Función para obtener la raza de un usuario
    const obtenerRaza = async (usuario) => {
      let datos = JSON.parse(await fs.readFile(razasPath, "utf8"));
      if (!datos[usuario]) {
        let razaAleatoria = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
        datos[usuario] = razaAleatoria;
        await fs.writeFile(razasPath, JSON.stringify(datos, null, 2)); // Guardar la raza asignada al usuario
        return razaAleatoria;
      }
      return datos[usuario];
    };

    // Obtener las razas de los jugadores
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

    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️
👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})

` +
      `💥 HP:
${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)
${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)

` +
      `⚡ MP:
${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)
${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)

` +
      `✨ Ataque Mágico:
${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)
${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)

⏳ *Batalla en curso...*`, { mentions: [usuario1, usuario2] }
    );

    while (stats[usuario1].HP > 0 && stats[usuario2].HP > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;

      let dano = Math.floor(Math.random() * 20) + 10;
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);

      // Incrementar MP y AM según la carga de la raza
      stats[atacante].MP = Math.min(100, stats[atacante].MP + razas[await obtenerRaza(atacante)].MP_carga);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + razas[await obtenerRaza(atacante)].AM_carga);

      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️
👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})

` +
          `💥 HP:
${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)
${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)

` +
          `⚡ MP:
${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)
${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)

` +
          `✨ Ataque Mágico:
${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)
${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)

` +
          `⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!*`,
        mentions: [usuario1, usuario2]
      });
    }

    let ganador = stats[usuario1].HP > 0 ? usuario1 : usuario2;
    await socket.sendMessage(remoteJid, {
      edit: sentMessage.key,
      text: `⚔️ *¡Batalla finalizada!* ⚔️
🏆 *GANADOR:* @${ganador.split("@")[0]} con ${stats[ganador].HP}% de vida restante!`,
      mentions: [usuario1, usuario2]
    });
  },
};
