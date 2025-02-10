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
  usage: `${PREFIX}creabot 1 o ${PREFIX}creabot 2`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      console.log("🚀 Iniciando creación del bot...");
      
      // 📌 Obtener la opción de la respuesta
      const mensaje = remoteJid.split('@')[0];  // Puede ser mensaje directo o número de teléfono
      const opcion = mensaje.split(' ')[1]; // Opción 1 o 2

      if (opcion !== '1' && opcion !== '2') {
        sendReply("⚠️ Debes responder con #creabot 1 para usar el QR o #creabot 2 para usar el código.");
        return;
      }

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

        // 📌 Opción de vinculación por QR
        if (opcion === '1' && qr) {
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

        // 📌 Opción de vinculación por código
        if (opcion === '2' && connection === "open") {
          const code = generateCode(); // Función para generar un código único
          console.log(`🔑 Código generado: ${code}`);
          await socket.sendMessage(remoteJid, { text: `📌 Usa este código para vincular tu bot: ${code}` });
          console.log("✅ Código enviado correctamente.");
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

// 📌 Función para generar un código único
function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}