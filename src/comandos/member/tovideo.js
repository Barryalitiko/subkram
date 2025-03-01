const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const { PREFIX, TEMP_DIR } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const subbots = {}; // Almacena los subbots activos

module.exports = {
  name: "subbot",
  description: "Conecta un subbot por QR o gestiona los subbots activos.",
  commands: ["subbot"],
  usage: `${PREFIX}subbot [connect|list|disconnect ID]`,
  handle: async ({ args, socket, remoteJid, sendReply }) => {
    const action = args[0];

    if (action === "connect") {
      return connectSubbot(remoteJid, sendReply);
    } else if (action === "list") {
      return listSubbots(sendReply);
    } else if (action === "disconnect" && args[1]) {
      return disconnectSubbot(args[1], sendReply);
    }

    await sendReply("Uso incorrecto. Usa:\n" +
      `${PREFIX}subbot connect - Conectar un subbot\n` +
      `${PREFIX}subbot list - Ver subbots activos\n` +
      `${PREFIX}subbot disconnect ID - Desconectar un subbot`);
  }
};

// Función para conectar un subbot
async function connectSubbot(remoteJid, sendReply) {
  const subbotId = `subbot_${Date.now()}`;
  const authDir = path.join(TEMP_DIR, subbotId);

  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const subbot = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  subbot.ev.on("creds.update", saveCreds);

  subbot.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      await sendReply("🔍 Escanea este QR para conectar el subbot:", { image: { url: qr } });
    }

    if (connection === "open") {
      console.log(chalk.green(`[${subbotId}] Subbot conectado exitosamente.`));
      subbots[subbotId] = { socket: subbot, authDir };
      await sendReply(`✅ Subbot conectado con ID: *${subbotId}*`);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(chalk.red(`[${subbotId}] Conexión cerrada. Razón: ${reason || "Desconocida"}`));
      delete subbots[subbotId];

      if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true });
      }
    }
  });

  subbot.ev.on("messages.upsert", async (message) => {
    console.log(`[${subbotId}] Mensaje recibido:`, message);
  });
}

// Función para listar subbots activos
async function listSubbots(sendReply) {
  if (Object.keys(subbots).length === 0) {
    return sendReply("📌 No hay subbots activos.");
  }

  let response = "🤖 Subbots activos:\n";
  for (const id of Object.keys(subbots)) {
    response += `- *${id}*\n`;
  }
  await sendReply(response);
}

// Función para desconectar un subbot
async function disconnectSubbot(subbotId, sendReply) {
  if (!subbots[subbotId]) {
    return sendReply("❌ No se encontró un subbot con ese ID.");
  }

  try {
    subbots[subbotId].socket.end();
    fs.rmSync(subbots[subbotId].authDir, { recursive: true, force: true });
    delete subbots[subbotId];

    await sendReply(`✅ Subbot *${subbotId}* desconectado.`);
  } catch (error) {
    console.error(chalk.red(`Error al desconectar el subbot ${subbotId}:`, error));
    await sendReply("❌ Error al intentar desconectar el subbot.");
  }
}