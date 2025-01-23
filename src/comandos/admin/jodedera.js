const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const statusFilePath = path.join(__dirname, "../assets/status.json"); // Ruta donde se guarda el estado

const readStatus = () => {
  try {
    const data = fs.readFileSync(statusFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { enabled: false }; // Si no existe el archivo, lo creamos con estado deshabilitado
  }
};

const writeStatus = (status) => {
  try {
    fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 2));
  } catch (error) {
    console.error("Error al escribir el archivo de estado:", error);
  }
};

module.exports = {
  name: "toggle",
  description: "Encender o apagar el sistema de comandos.",
  commands: ["sx"],
  usage: `${PREFIX}toggle <on/off>`,
  handle: async ({ socket, remoteJid, sendReply, args, sendReact, webMessage }) => {
    try {
      const currentStatus = readStatus();

      // Si no se proporciona un argumento válido, se envía un mensaje de uso.
      if (!args[0] || (args[0] !== "on" && args[0] !== "off")) {
        await sendReact("❓", webMessage.key); // Reacción para uso incorrecto
        await sendReply("❌ Uso incorrecto. Usa `on` para encender o `off` para apagar. Ejemplo: `!toggle on`");
        return;
      }

      const newStatus = args[0] === "on"; // Si es "on", se enciende, si es "off", se apaga.
      writeStatus({ enabled: newStatus });

      if (newStatus) {
        await sendReact("🔞", webMessage.key); // Reacción para encendido
        await sendReply("✅ El sistema de comandos ha sido **encendido**. Ahora puedes usar los comandos.");
      } else {
        await sendReact("😞", webMessage.key); // Reacción para apagado
        await sendReply("❌ El sistema de comandos ha sido **apagado**. Los comandos no funcionarán hasta que se encienda.");
      }
    } catch (error) {
      console.error("Error al cambiar el estado del sistema:", error);
      await sendReact("🚫", webMessage.key); // Reacción para error
      await sendReply("Solo los admins pueden ejecutar este comando");
    }
  },
};