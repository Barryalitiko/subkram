const { PREFIX } = require("../../krampus");
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const QRCode = require("qrcode"); // Biblioteca para generar QR

const subbots = {}; // Almacena los subbots activos

module.exports = {
  name: "subbot",
  description: "Inicia un subbot conectado por QR.",
  commands: ["subbot"],
  usage: `${PREFIX}subbot`,
  
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      await sendReply("🔄 Generando subbot... Escanea el QR cuando llegue.");
      await iniciarSubbot(socket, remoteJid);
    } catch (error) {
      console.error(chalk.red("⚠️ Error al iniciar el subbot:"), error);
      await sendReply("❌ Hubo un error al generar el subbot.");
    }
  }
};

async function iniciarSubbot(socket, remoteJid) {
  try {
    const subbotId = `subbot_${Date.now()}`;
    const sessionPath = path.join(__dirname, "subbot_sessions", subbotId);

    // Crear directorio si no existe
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const subbot = makeWASocket({
      auth: state,
      printQRInTerminal: false, // No mostrar QR en consola
      connectTimeoutMs: 60000,
    });

    // Manejo del código QR
    subbot.ev.on("connection.update", async ({ qr, connection, lastDisconnect }) => {
      if (qr) {
        console.log(chalk.green(`📸 Generando QR para el subbot ${subbotId}...`));

        const qrPath = path.join(sessionPath, "subbot_qr.png");
        await QRCode.toFile(qrPath, qr); // Generar imagen QR

        await socket.sendMessage(remoteJid, { 
          image: { url: qrPath }, 
          caption: "📷 Escanea este QR para conectar el subbot." 
        });

        console.log(chalk.green(`✅ QR enviado para el subbot ${subbotId}`));
      }

      if (connection === "close") {
        console.log(chalk.red(`❌ La conexión del subbot ${subbotId} se cerró.`));
        if (lastDisconnect?.error) console.error(chalk.red("Error de conexión:"), lastDisconnect.error);

        delete subbots[subbotId];

        setTimeout(() => {
          console.log(chalk.yellow(`🔄 Reintentando conexión del subbot ${subbotId}...`));
          iniciarSubbot(socket, remoteJid);
        }, 5000);
      }
    });

    subbot.ev.on("creds.update", saveCreds);

    subbots[subbotId] = subbot;
  } catch (error) {
    console.error(chalk.red("⚠️ Error al iniciar el subbot:"), error);
  }
}