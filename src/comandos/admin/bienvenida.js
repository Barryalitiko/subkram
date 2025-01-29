const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

const welcomeConfigPath = path.resolve(process.cwd(), "assets/welcomeConfig.json");

// Leer el archivo de configuración de bienvenida
const readWelcomeConfig = () => {
try {
const data = fs.readFileSync(welcomeConfigPath);
return JSON.parse(data);
} catch (error) {
return {}; // Si hay un error, devolver un objeto vacío
}
};

// Guardar la configuración de bienvenida en el archivo JSON
const writeWelcomeConfig = (config) => {
fs.writeFileSync(welcomeConfigPath, JSON.stringify(config, null, 2));
};

module.exports = {
name: "welcome",
description: "Activa, desactiva o configura el saludo de bienvenida.",
commands: ["welcome", "bienvenida"],
usage: `${PREFIX}welcome (0/1/2)`,
handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
if (!args.length) {
throw new InvalidParameterError(
"👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 Escribe 0, 1 o 2 para configurar la bienvenida:\n\n" +
"_0_: Desactivar\n" +
"_1_: Activar con foto\n" +
"_2_: Activar sin foto"
);
}

const option = args[0];

if (!["0", "1", "2"].includes(option)) {
  throw new InvalidParameterError(
    "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 Opción inválida. Usa:\n\n" +
    "*0*: Desactivar\n" +
    "*1*: Activar con foto\n" +
    "*2*: Activar sin foto"
  );
}

// Leer la configuración actual
const welcomeConfig = readWelcomeConfig();

// Si la opción es 0, desactivamos la bienvenida para el grupo
if (option === "0") {
  delete welcomeConfig[remoteJid]; // Eliminar la entrada del grupo
} else {
  // Activamos la bienvenida y guardamos el modo de bienvenida (1 o 2)
  welcomeConfig[remoteJid] = {
    enabled: true,
    mode: option,
  };
}

// Guardar la configuración actualizada
writeWelcomeConfig(welcomeConfig);

await sendSuccessReact();

const context =
  option === "0"
    ? "Desactivada"
    : option === "1"
      ? "Activada con foto"
      : "Activada sin foto";

await sendReply(
  `👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 La bienvenida ha sido configurada como: *${context}*.` 
);
},
};