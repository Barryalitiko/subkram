const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const MARRIAGE_FILE_PATH = path.resolve(process.cwd(), "assets/marriage.json");
const PENDING_MARRIAGES_FILE = path.resolve(process.cwd(), "assets/pending_marriages.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error al escribir en el archivo ${filePath}: ${error.message}`);
  }
};

module.exports = {
  name: "respuesta",
  description: "Responder a una propuesta de matrimonio.",
  commands: ["#r"],
  usage: `${PREFIX}#r si` || `${PREFIX}#r no`,
  handle: async ({ sendReply, userJid, args, remoteJid, socket }) => {
    if (!args[0] || (args[0] !== "si" && args[0] !== "no")) {
      await sendReply("Debes responder con *#r si* o *#r no*.");
      return;
    }

    let pendingMarriages = readData(PENDING_MARRIAGES_FILE);
    pendingMarriages = pendingMarriages.filter(entry => Date.now() - entry.timestamp < 60000); // Limpiar propuestas viejas

    const proposal = pendingMarriages.find(entry => entry.proposedTo === userJid);

    if (!proposal) {
      await sendReply("❌ No tienes ninguna propuesta de matrimonio pendiente.\n> Krampus OM bot");
      return;
    }

    // Eliminar la propuesta del archivo
    pendingMarriages = pendingMarriages.filter(entry => entry.proposedTo !== userJid);
    writeData(PENDING_MARRIAGES_FILE, pendingMarriages);

    if (args[0] === "si") {
      // Guardar matrimonio en marriage.json
      let marriages = readData(MARRIAGE_FILE_PATH);
      marriages.push({
        userJid: proposal.proposer,
        partnerJid: userJid,
        date: new Date().toISOString()
      });
      writeData(MARRIAGE_FILE_PATH, marriages);

      await socket.sendMessage(remoteJid, {
        text: `🎉 ¡Felicidades!\n\n*@${proposal.proposer.split("@")[0]}* y *@${userJid.split("@")[0]}* ahora están casados. 💍\n\n> Krampus OM bot`,
        mentions: [proposal.proposer, userJid]
      });
    } else {
      await socket.sendMessage(remoteJid, {
        text: `💔 *@${userJid.split("@")[0]}* ha rechazado la propuesta de *@${proposal.proposer.split("@")[0]}*.\Krampus OM bot`,
        mentions: [proposal.proposer, userJid]
      });
    }
  },
};