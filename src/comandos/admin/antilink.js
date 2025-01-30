const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const {
activateAntiLinkGroup,
deactivateAntiLinkGroup,
setAntiLinkMode,
} = require("../../utils/database");

module.exports = {
name: "anti-link",
description: "Activa/desactiva/configura el recurso de anti-link en el grupo.",
commands: ["anti-link"],
usage: `${PREFIX}anti-link (0/1/2)`,
handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
if (!args.length) {
throw new InvalidParameterError(
"👻 Krampus.bot 👻 Activa con 1, 2 o 0 (conectar, conectar completo o desconectar)!"
);
}

const mode = args[0];

if (!["0", "1", "2"].includes(mode)) {
  throw new InvalidParameterError(
    "👻Krampus.bot👻 Activa con 1, 2 o 0 (conectar, conectar completo o desconectar)!"
  );
}

if (mode === "0") {
  deactivateAntiLinkGroup(remoteJid);
} else {
  activateAntiLinkGroup(remoteJid);
  setAntiLinkMode(remoteJid, mode);
}

await sendSuccessReact();

const context =
  mode === "0"
    ? "desactivado"
    : mode === "1"
    ? "activado (solo grupos)"
    : "activado (completo)";

await sendReply(`El anti-link ha sido ${context}!`);
},
};

