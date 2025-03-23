const path = require("path");
const fs = require("fs");
const { PREFIX } = require("../../krampus");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = {
  name: "serbot",
  description: "Convertir número en bot con código de vinculación",
  commands: ["serbot"],
  usage: `${PREFIX}serbot`,
  handle: async ({ sendReply, sendReact, sender }) => {
    console.log("Iniciando el proceso de creación del subbot...");
    const subbotName = `subkramp_${Date.now()}`;
    const subbotPath = path.join(__dirname, `../subkramp/${subbotName}`);

    // Crear carpeta para el subbot si no existe
    if (!fs.existsSync(subbotPath)) {
      fs.mkdirSync(subbotPath, { recursive: true });
      console.log(`Carpeta creada en: ${subbotPath}`);
    }

    // Configuración del subbot
    const authPath = path.join(subbotPath, "auth");
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();
    console.log("Configuración de autenticación y versión de Baileys obtenida.");

    const subbot = makeWASocket({
      version,
      logger: pino({ level: "error" }),
      printQRInTerminal: false,
      auth: state,
    });
    console.log("Subbot creado correctamente.");

    // Generar código de vinculación
    console.log("Solicitando código de vinculación...");
    const code = await subbot.requestPairingCode(sender);
    console.log(`Código de vinculación generado: ${code}`);
    await sendReply(`*Tu código de vinculación es:* ${code}`);

    // Manejo de conexión
    subbot.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === "open") {
        console.log("Subbot conectado correctamente.");
        await sendReply("✅ *Subbot conectado correctamente!* ");
        await saveCreds();
      } else if (connection === "close") {
        console.log("Subbot desconectado, evaluando si se debe reconectar...");
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log("Intentando reconectar el subbot...");
          await sendReply("⚠️ *Intentando reconectar el subbot...*");
          await module.exports.handle({ sendReply, sendReact, sender });
        } else {
          console.log("El subbot se ha desconectado permanentemente.");
          await sendReply("❌ *El subbot se ha desconectado permanentemente.*");
        }
      }
    });

    // Guardar credenciales
    subbot.ev.on("creds.update", () => {
      console.log("Credenciales actualizadas y guardadas.");
      saveCreds();
    });
  },
};
