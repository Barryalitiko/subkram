const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const SESSIONS_PATH = path.resolve(__dirname, "../../../sessions"); // Ruta absoluta a la carpeta de sesiones
const BOT_MAIN_PATH = path.resolve(__dirname, "../../.."); // Ajusta si es necesario

module.exports = {
  name: "creabot",
  description: "Convierte tu número en un bot de WhatsApp",
  commands: ["creabot"],
  usage: `${PREFIX}creabot`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    console.log("📌 Comando 'creabot' ejecutado por:", remoteJid);

    sendReply("🟢 Generando QR, espera un momento...");

    // Verificar si la carpeta de sesiones existe
    if (!fs.existsSync(SESSIONS_PATH)) {
      console.log("⚠️ La carpeta 'sessions' no existe. Creándola...");
      fs.mkdirSync(SESSIONS_PATH, { recursive: true });
    }

    const sessionId = path.join(SESSIONS_PATH, remoteJid.split("@")[0]);
    console.log("📂 Ruta de sesión:", sessionId);

    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionId);
      console.log("✅ Estado de autenticación obtenido correctamente.");

      const newSocket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
      });

      newSocket.ev.on("connection.update", async (update) => {
        const { qr, connection, lastDisconnect } = update;
        console.log("🔄 Estado de conexión actualizado:", update);

        if (qr) {
          console.log("📸 Generando QR...");
          const qrImage = await QRCode.toDataURL(qr);
          await socket.sendMessage(remoteJid, { image: { url: qrImage }, caption: "Escanea este QR para convertir tu número en un bot." });
          console.log("✅ QR enviado al usuario.");
        }

        if (connection === "open") {
          sendReply("✅ ¡Tu número ahora es un bot activo!");
          console.log("✅ Conexión establecida con éxito.");
          await cargarComandos(newSocket);
        }

        if (connection === "close") {
          console.log("❌ Conexión cerrada. Verificando si se debe reconectar...");
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            console.log("🔄 Reintentando conexión...");
            makeWASocket({ auth: state });
          } else {
            console.log("🛑 Se cerró la sesión (Logged out). No se intentará reconectar.");
          }
        }
      });

      newSocket.ev.on("creds.update", saveCreds);
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      sendReply("❌ Ocurrió un error al generar el QR.");
    }
  },
};

// 📌 Función para cargar los comandos del bot principal en el nuevo bot
async function cargarComandos(newSocket) {
  const comandosPath = path.join(BOT_MAIN_PATH, "src/comandos/");
  console.log("📂 Cargando comandos desde:", comandosPath);

  if (!fs.existsSync(comandosPath)) {
    console.error("❌ No se encontró la carpeta de comandos.");
    return;
  }

  const archivos = fs.readdirSync(comandosPath).filter((file) => file.endsWith(".js"));
  console.log(`📌 Se encontraron ${archivos.length} comandos.`);

  for (const archivo of archivos) {
    console.log(`📄 Cargando comando: ${archivo}`);
    const comando = require(path.join(comandosPath, archivo));

    newSocket.ev.on("messages.upsert", async (m) => {
      const mensaje = m.messages[0];
      if (!mensaje.message || mensaje.key.fromMe) return;

      const texto = mensaje.message.conversation || mensaje.message.extendedTextMessage?.text || "";
      if (comando.commands.includes(texto.split(" ")[0])) {
        console.log(`⚡ Ejecutando comando: ${texto}`);
        await comando.handle({
          socket: newSocket,
          remoteJid: mensaje.key.remoteJid,
          sendReply: (msg) => newSocket.sendMessage(mensaje.key.remoteJid, { text: msg }),
        });
      }
    });
  }

  console.log("✅ Todos los comandos fueron cargados en el nuevo bot.");
}