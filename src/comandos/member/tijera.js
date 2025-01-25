const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const statusFilePath = path.resolve(process.cwd(), "assets/status.json");

const cooldowns = new Map(); // Mapa para almacenar el tiempo del último uso por usuario

const readStatus = () => {
  try {
    const data = fs.readFileSync(statusFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { enabled: false }; // Si no existe el archivo, devolvemos deshabilitado
  }
};

module.exports = {
  name: "kiss",
  description: "Enviar un beso a alguien. Debes etiquetar o responder a un usuario.",
  commands: ["tijera"],
  usage: `${PREFIX}kiss @usuario o responde a un mensaje`,
  handle: async ({ socket, remoteJid, sendReply, sendReact, args, isReply, replyJid, userJid }) => {
    try {
      const currentStatus = readStatus();
      if (!currentStatus.enabled) {
        await sendReply("❌ El sistema de comandos está apagado. Por favor, enciéndelo para usar este comando.");
        return;
      }

      const now = Date.now();
      const cooldownTime = 20 * 1000; // 20 segundos de cooldown

      // Verificamos si el usuario está en cooldown
      if (cooldowns.has(userJid)) {
        const lastUsed = cooldowns.get(userJid);
        if (now - lastUsed < cooldownTime) {
          const remainingTime = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
          await sendReply(`❌ Estás en cooldown. Espera ${remainingTime} segundos para usar el comando nuevamente.`);
          return;
        }
      }

      // Actualizamos el tiempo de la última ejecución
      cooldowns.set(userJid, now);

      let targetJid;

      // Si el comando es una respuesta a un mensaje, obtenemos el JID del destinatario
      if (isReply) {
        targetJid = replyJid;
      }
      // Si el comando incluye una etiqueta, obtenemos el JID de la etiqueta
      else if (args && args.length > 0) {
        targetJid = args[0].replace("@", "") + "@s.whatsapp.net";
      }

      // Si no hay destinatario, enviamos un mensaje de error
      if (!targetJid) {
        await sendReply("❌ Debes etiquetar o responder a un usuario para enviarle un beso.");
        return;
      }

      // Enviar el beso
      await sendReact("✂", remoteJid);
      await socket.sendMessage(remoteJid, {
        video: fs.readFileSync("assets/sx/tijera.mp4"),
        caption: `> 𝑫𝑰𝑨 𝑫𝑬 𝑪𝑶𝑳𝑶𝑹𝑬𝑺?\n@${userJid.split("@")[0]} 𝒚