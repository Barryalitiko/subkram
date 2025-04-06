const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "restaurarvida",
  description: "Restaura la vida del jugador al 100% con animación de carga",
  commands: ["restaurarvida"],
  usage: `${PREFIX}restaurarvida`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    let usuario = webMessage.key.participant;
    
    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");
    const razasPath = path.resolve(process.cwd(), "assets/razas.json");
    
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};
    let razas = JSON.parse(fs.readFileSync(razasPath, "utf8"));
    
    if (!jugadores[usuario]) {
      return sendReply("⚠️ No tienes una raza asignada. Participa en una batalla para obtener una.");
    }
    
    let raza = jugadores[usuario].raza;
    let vidaMaxima = jugadores[usuario].maxCorazones || razas[raza].HP; // Usar maxCorazones si está disponible
    
    let mensajeCarga = await sendReply("🩹 Restaurando vida...");
    let barra = "";
    
    for (let i = 0; i <= 10; i++) {
      barra = "▓".repeat(i) + "░".repeat(10 - i);
      await new Promise(resolve => setTimeout(resolve, 300));
      await socket.sendMessage(remoteJid, {
        edit: mensajeCarga.key,
        text: `🩹 Restaurando vida... ${barra} (${i * 10}%)`
      });
    }
    
    jugadores[usuario].HP = vidaMaxima; // Restaurar vida al máximo
    fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));
    
    await socket.sendMessage(remoteJid, {
      edit: mensajeCarga.key,
      text: `✅ *Vida restaurada al 100%!* \n💖 HP: ${vidaMaxima}%`
    });
  }
};
