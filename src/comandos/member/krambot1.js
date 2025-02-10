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
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      console.log("🚀 Iniciando creación del bot con QR...");

      // 📌 Crear una carpeta de sesión única para el bot
      const sessionFolder = `${SESSION_PATH}/${remoteJid.split("@")[0]}`; // Usar el remoteJid como identificador único
      if (!fs.existsSync(sessionFolder)) {
        fs.mkdirSync(sessionFolder, { recursive: true });
        console.log(`📂 Creando carpeta de sesión para el bot en: ${sessionFolder}`);
      }

      // 📌 Cargar credenciales para esta sesión de forma aislada
      const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
      console.log("✅ Sesión cargada correctamente para este bot.");

      // 📌 Crear el socket de WhatsApp para esta sesión aislada
      const newSocket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: require("pino")({ level: "debug" }),
      });

      // 📌 Manejo de eventos de conexión
      newSocket.ev.on("connection.update", async (update) => {
        const { qr, connection, lastDisconnect } = update;

        if (qr) {
          try {
            console.log("📸 QR recibido, generando enlace...");
            const qrLink = await QRCode.toDataURL(qr);
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