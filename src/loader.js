const { TIMEOUT_IN_MILLISECONDS_BY_EVENT } = require("./config");
const { infoLog, errorLog } = require("./utils/logger");
const { onMessagesUpsert } = require("./middlewares/onMessagesUpsert");
const {
  onGroupParticipantsUpdate,
} = require("./middlewares/onGroupParticipantsUpdate");

async function load(socket) {
  try {
    infoLog("Cargando servicios...");

    // Registrar eventos del socket
    socket.ev.on("messages.upsert", async ({ messages }) => {
      setTimeout(() => {
        try {
          onMessagesUpsert({ socket, messages });
        } catch (error) {
          console.error("Error en 'messages.upsert':", error);
        }
      }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
    });

    socket.ev.on("group-participants.update", async (data) => {
      setTimeout(() => {
        try {
          onGroupParticipantsUpdate({ socket, groupParticipantsUpdate: data });
        } catch (error) {
          console.error("Error en 'group-participants.update':", error);
        }
      }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
    });

    infoLog("CARGANDO OPERACION MARSHALL...");
  } catch (error) {
    errorLog("Error al cargar servicios: ", error);
  }
}

module.exports = { load };
