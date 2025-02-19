const { PREFIX } = require("../../krampus");

module.exports = {
name: "pruebaCita",
description: "Envía un mensaje con cita.",
commands: ["pruebacita"],
usage: `${PREFIX}pruebacita`,
handle: async ({ socket, remoteJid, sendReply, sendReact, webMessage, sendQuotedMessage }) => {
try {
await sendReact("📝", webMessage.key);
const text = "Este es un mensaje de prueba con cita.";
const contextInfo = {
quotedMessage: "Este es el texto de la cita.",
quotedParticipant: "0@s.whatsapp.net",
};
await sendQuotedMessage(text, contextInfo);
} catch (error) {
console.error("Error al enviar el mensaje con cita:", error.message);
await sendReply("Ocurrió un error al intentar enviar el mensaje con cita.");
}
},
};