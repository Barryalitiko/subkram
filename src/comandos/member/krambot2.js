const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

// 📌 Ruta de la carpeta de sesiones
const SESSION_PATH = path.join(__dirname, "../../../sessions");

module.exports = {
  name: "creabot2",
  description: "Convierte tu número en un bot de WhatsApp usando código",
  commands: ["creabot2"],
  usage: `${PREFIX}creabot2`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      console.log("🚀 Iniciando creación del bot con código...");
      
      // 📌 Verificar si la carpeta "sessions" existe, si no, crearla
      if (!fs.existsSync(SESSION_PATH)) {
        console.log("📂 Creando carpeta 'sessions'...");
        fs.mkdirSync(SESSION_PATH, { recursive: true });
      }

      // 📌 Obtener el ID único para la sesión
      const sessionId = `${SESSION_PATH}/${remoteJid.split("@")[0]}`;
      console.log(`🗂️ Ruta de la sesión: ${sessionId}`);

      // 📌 Cargar credenciales de la sesión
      const { state, saveCreds } = await useMultiFileAuthState(sessionId);
      console.log("✅ Sesión cargada correctamente.");

      // 📌 Crear el socket de WhatsApp
      const newSocket = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Evita imprimir el QR en consola
        logger: require("pino")({ level: "debug" }), // 🔹 Agrega logs detallados
      });

      // 📌 Generación de código único
      const code = generateCode(); // Función para generar un código único
      console.log(`🔑 Código generado: ${code}`);
      await socket.sendMessage(remoteJid, { text: `📌 Usa este código para vincular tu bot: ${code}` });
      console.log("✅ Código enviado correctamente.");

      // 📌 Manejo de eventos de conexión
      newSocket.ev.on("connection.update", async (update) => {
        console.log("🔄 Evento de conexión:", JSON.stringify(update, null, 2));

        const { connection, lastDisconnect } = update;

        if (connection === "open") {
          console.log("✅ Bot conectado exitosamente.");
          sendReply("✅ ¡Tu número ahora es un bot activo!");
        }

        if (connection === "close") {
          console.log("❌ Conexión cerrada.");
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            console.log("🔄 Reintentando conexión...");
            makeWASocket({ auth: state });
          } else {
            console.log("🔒 El usuario cerró sesión, no se puede reconectar.");
          }
        }
      });

      // 📌 Guardar credenciales cuando se actualicen
      newSocket.ev.on("creds.update", saveCreds);
    } catch (error) {
      console.error("❌ Error en el comando creabot2:", error);
      sendReply("⚠️ Hubo un problema al generar el bot.");
    }
  },
};

// 📌 Función para generar un código único
function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}