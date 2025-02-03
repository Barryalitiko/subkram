const { PREFIX } = require("../../krampus");

module.exports = {
name: "hola",
description: "prueba",
commands: ["hola"],
usage: `${PREFIX}hola`,
handle: async ({ socket, remoteJid, sendReplyWithButton }) => {
const menuMessage = `hola`;
const buttons = [
{
buttonId: "ver_canal",
buttonText: "Ver canal",
type: 1,
},
];
await sendReplyWithButton(menuMessage, buttons);
},
};



