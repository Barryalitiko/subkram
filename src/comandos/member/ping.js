const { PREFIX } = require("../../krampus");

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online y enviar un enlace",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendReply, sendReact, socket, remoteJid, webMessage }) => {
    const startTime = Date.now();
    await sendReact("👻");
    const endTime = Date.now();
    const latency = endTime - startTime;
    const speed = latency.toFixed(2) + "ms";

    const link = "https://chat.whatsapp.com/CKGdQzPqKH95x0stiUZpFs"; // Enlace a enviar
    const text = "¡Aquí está el enlace con previsualización!"; // Texto que acompañará el enlace

    // Enviar el enlace con previsualización
    await sendLinkWithDelay(socket, remoteJid, webMessage, link, text);
    
    // Respuesta con la velocidad de respuesta
    await sendReply(`Velocidad de respuesta: ${speed}\n> Krampus OM bot`);
  },
};