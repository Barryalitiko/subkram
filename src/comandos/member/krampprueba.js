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
  handle: async (context) => {
    try {
      console.log("Iniciando el proceso de creación del subbot...");
      console.log("Contexto recibido:", JSON.stringify(context, null, 2));
      
      const { sendReply, sendReact, userJid, webMessage } = context;
      
      if (!sendReply || typeof sendReply !== "function") {
        console.error("❌ Error: sendReply no está definido correctamente.");
        return;
      }
      
      // Extraer número del remitente desde distintas fuentes
      let sender = context.sender || userJid || webMessage?.key?.participant;
      
      if (!sender) {
        console.error("❌ Error: No se recibió el número del remitente.");
        await sendReply("❌ *Error:* No se pudo obtener tu número. Intenta nuevamente.");
        return;
      }
      
      sender = sender.replace(/[^0-9]/g, ""); // Limpiar el número
      console.log(`Número del remitente recibido: ${sender}`);
      
      if (isNaN(sender) || sender.length < 10) {
        console.error(`❌ Error: El número del remitente no es válido. Número recibido: ${sender}`);
        await sendReply(`❌ *Error:* Número de teléfono inválido (${sender}). Asegúrate de escribirlo correctamente.`);
        return;
      }
      
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
        logger: pino({ level: "debug" }),
        printQRInTerminal: false,
        auth: state,
      });
      console.log("Subbot creado correctamente.");

      // Generar código de vinculación
      console.log(`Solicitando código de vinculación para ${sender}...`);
      try {
        const code = await subbot.requestPairingCode(sender);
        console.log(`✅ Código de vinculación generado: ${code}`);
        await sendReply(`*Tu código de vinculación es:* ${code}`);
      } catch (error) {
        console.error("❌ Error al generar el código de vinculación:", error);
        await sendReply("❌ *Error:* No se pudo generar el código de vinculación. Intenta de nuevo más tarde.");
        return;
      }

      // Manejo de conexión
      subbot.ev.on("connection.update", async (update) => {
        console.log("🔄 Actualización de conexión recibida:", update);
        const { connection, lastDisconnect } = update;
        
        if (connection === "open") {
          console.log("✅ Subbot conectado correctamente.");
          await sendReply("✅ *Subbot conectado correctamente!* ");
          await saveCreds();
        } else if (connection === "close") {
          console.log("⚠️ Subbot desconectado, evaluando si se debe reconectar...");
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            console.log("🔄 Intentando reconectar el subbot...");
            await sendReply("⚠️ *Intentando reconectar el subbot...*");
            await module.exports.handle(context);
          } else {
            console.log("❌ El subbot se ha desconectado permanentemente.");
            await sendReply("❌ *El subbot se ha desconectado permanentemente.*");
          }
        }
      });

      // Guardar credenciales
      subbot.ev.on("creds.update", () => {
        console.log("💾 Credenciales actualizadas y guardadas.");
        saveCreds();
      });
    } catch (error) {
      console.error("❌ Error inesperado en el proceso de creación del subbot:", error);
      await context.sendReply("❌ *Error inesperado:* No se pudo crear el subbot. Inténtalo de nuevo más tarde.");
    }
  },
};
