const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

// 📌 Ruta de la carpeta de sesiones
const SESSION_PATH = path.join(__dirname, "../../../sessions");

module.exports = {
  name: "creabot",
  description: "Convierte tu número en un bot de WhatsApp",
  commands: ["creabot"],
  usage: `${PREFIX}creabot`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      console.log("🚀 Iniciando creación del bot...");
      sendReply("🟢 Generando QR, espera un momento...");

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

      // 📌 Manejo de eventos de conexión
      newSocket.ev.on("connection.update", async (update) => {
        console.log("🔄 Evento de conexión:", JSON.stringify(update, null, 2));

        const { qr, connection, lastDisconnect } = update;

        if (qr) {
          try {
            console.log("📸 QR recibido, generando imagen...");
            // Generar la imagen del QR y guardarla en el disco
            const qrImagePath = path.join(__dirname, 'qr-image.png');
            await QRCode.toFile(qrImagePath, qr);
            console.log("✅ Imagen del QR guardada correctamente.");

            // Enviar la imagen del QR al usuario
            await socket.sendMessage(remoteJid, { 
              image: { url: qrImagePath }, 
              caption: "📌 Escanea este QR para convertir tu número en un bot."
            });
            console.log("✅ Imagen del QR enviada correctamente.");
          } catch (error) {
            console.error("❌ Error al generar/enviar la imagen del QR:", error);
            sendReply("⚠️ Ocurrió un error al generar el QR. Inténtalo de nuevo.");
          }
        }

        if (connection === "open") {
          console.log("✅ Bot conectado exitosamente.");
          sendReply("✅ ¡Tu número ahora es un bot activo!");
          await cargarComandos(newSocket);
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
      console.error("❌ Error en el comando creabot:", error);
      sendReply("⚠️ Hubo un problema al generar el bot.");
    }
  },
};

// 📌 Función para cargar los mismos comandos del bot principal
async function cargarComandos(newSocket) {
  try {
    const comandosPath = path.join(__dirname, "../../comandos/");
    if (!fs.existsSync(comandosPath)) {
      console.error("❌ No se encontró la carpeta de comandos.");
      return;
    }

    console.log(`📂 Cargando comandos desde: ${comandosPath}`);
    const archivos = fs.readdirSync(comandosPath).filter((file) => file.endsWith(".js"));

    for (const archivo of archivos) {
      console.log(`⚙️ Cargando comando: ${archivo}`);
      const comando = require(path.join(comandosPath, archivo));
      newSocket.ev.on("messages.upsert", async (m) => {
        const mensaje = m.messages[0];
        if (!mensaje.message || mensaje.key.fromMe) return;

        const texto = mensaje.message.conversation || mensaje.message.extendedTextMessage?.text || "";
        if (comando.commands.includes(texto.split(" ")[0])) {
          await comando.handle({
            socket: newSocket,
            remoteJid: mensaje.key.remoteJid,
            sendReply: (msg) => newSocket.sendMessage(mensaje.key.remoteJid, { text: msg }),
          });
        }
      });
    }

    console.log("✅ Todos los comandos han sido cargados en el nuevo bot.");
  } catch (error) {
    console.error("❌ Error al cargar los comandos:", error);
  }
}