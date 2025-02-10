const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

// 📌 Ruta de la carpeta de sesiones
const SESSION_PATH = path.join(__dirname, "../../../sessions");

module.exports = {
  name: "creabot1",
  description: "Convierte tu número en un bot de WhatsApp usando QR",
  commands: ["creabot1"],
  usage: `${PREFIX}creabot1`,
  handle: async ({ socket, remoteJid, sendReply, message }) => {
    try {
      console.log("🚀 Iniciando creación del bot con QR...");
      
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
            console.log("📸 QR recibido, generando enlace...");
            // Generar enlace con QR
            const qrLink = await QRCode.toDataURL(qr);
            console.log("✅ Enlace del QR generado correctamente.");
            // Enviar el enlace del QR en lugar de la imagen
            await socket.sendMessage(remoteJid, { text: `📌 Escanea este QR para convertir tu número en un bot:\n\n${qrLink}` });
            console.log("✅ Enlace del QR enviado correctamente.");
          } catch (error) {
            console.error("❌ Error al generar/enviar el enlace del QR:", error);
            sendReply("⚠️ Ocurrió un error al generar el QR. Inténtalo de nuevo.");
          }
        }

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
      console.error("❌ Error en el comando creabot1:", error);
      sendReply("⚠️ Hubo un problema al generar el bot.");
    }
  },
};