const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const BOT_MAIN_PATH = path.resolve(__dirname, "../../../"); // Ajusta según tu estructura

module.exports = {
  name: "creabot",
  description: "Convierte tu número en un bot de WhatsApp",
  commands: ["creabot"],
  usage: `${PREFIX}creabot`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    sendReply("🟢 Generando QR, espera un momento...");

    const sessionId = `sessions/${remoteJid.split("@")[0]}`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionId);

    const newSocket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    newSocket.ev.on("connection.update", async (update) => {
      const { qr, connection, lastDisconnect } = update;

      if (qr) {
        const qrImage = await QRCode.toDataURL(qr);
        await socket.sendMessage(remoteJid, { image: { url: qrImage }, caption: "Escanea este QR para convertir tu número en un bot." });
      }

      if (connection === "open") {
        sendReply("✅ ¡Tu número ahora es un bot activo!");
        await cargarComandos(newSocket);
      }

      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          makeWASocket({ auth: state });
        }
      }
    });

    newSocket.ev.on("creds.update", saveCreds);
  },
};

// 📌 Función para cargar los mismos comandos del bot principal
async function cargarComandos(newSocket) {
  const comandosPath = path.join(BOT_MAIN_PATH, "src/comandos/");
  if (!fs.existsSync(comandosPath)) {
    console.error("❌ No se encontró la carpeta de comandos.");
    return;
  }

  const archivos = fs.readdirSync(comandosPath).filter((file) => file.endsWith(".js"));

  for (const archivo of archivos) {
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

  console.log(`✅ Comandos cargados en el nuevo bot.`);
}