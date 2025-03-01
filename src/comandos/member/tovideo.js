const { PREFIX } = require("../../krampus");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode");
const chalk = require("chalk");

// Almacén de subbots activos
const subbots = {};

module.exports = {
  name: "subbot",
  description: "Conecta un subbot mediante QR.",
  commands: ["subbot"],
  usage: `${PREFIX}subbot`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    try {
      // Generar un ID único para cada subbot
      const subbotId = `subbot_${Date.now()}`;
      const sessionPath = path.join(__dirname, `../../subbot_sessions/${subbotId}`);

      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      // Crear el nuevo subbot
      const subbot = makeWASocket({
        auth: state,
        printQRInTerminal: false, // No mostrar el QR en la terminal
      });

      subbots[subbotId] = subbot; // Guardar el subbot en memoria

      // Manejar eventos del subbot
      subbot.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          const qrPath = path.join(__dirname, `../../subbot_sessions/${subbotId}.png`);
          await qrcode.toFile(qrPath, qr);

          if (fs.existsSync(qrPath)) {
            await socket.sendMessage(remoteJid, {
              image: { url: qrPath },
              caption: "📲 Escanea este QR para conectar el subbot.",
            });

            // Borrar el QR después de 30 segundos
            setTimeout(() => fs.unlinkSync(qrPath), 30000);
          } else {
            await sendReply("❌ No se pudo generar el código QR.");
          }
        }

        if (connection === "open") {
          console.log(chalk.green(`✅ Subbot conectado: ${subbotId}`));
          await sendReply(`✅ Subbot conectado exitosamente.`);
        } else if (connection === "close") {
          console.log(chalk.red(`❌ La conexión del subbot ${subbotId} se cerró.`));

          if (lastDisconnect?.error) {
            console.error(chalk.red("Error de conexión:"), lastDisconnect.error);
          }

          delete subbots[subbotId]; // Eliminar el subbot de la memoria
        }
      });

      subbot.ev.on("creds.update", saveCreds);
    } catch (error) {
      console.error(chalk.red("❌ Error al iniciar el subbot:"), error);
      await sendReply("❌ Hubo un error al iniciar el subbot.");
    }
  },
};