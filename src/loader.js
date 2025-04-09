const { TIMEOUT_IN_MILLISECONDS_BY_EVENT } = require("./krampus");
const { onMessagesUpsert } = require("./middlewares/onMessagesUpsert");
const { onGroupParticipantsUpdate } = require("./middlewares/onGroupParticipantsUpdate");

exports.load = async (socket) => {
  // Verifica si el socket es válido antes de intentar acceder a sus métodos
  if (!socket || !socket.ev) {
    console.error("Socket no está disponible o no tiene el evento 'ev'");
    return;
  }

  // Espera hasta que el socket esté completamente conectado
  if (!socket.isConnected()) {
    console.log("Esperando a que el socket se conecte...");
    await new Promise(resolve => {
      socket.ev.on("connection.update", (update) => {
        if (update.connection === "open") {
          resolve();
        }
      });
    });
  }

  socket.ev.on("messages.upsert", async ({ messages }) => {
    setTimeout(() => {
      onMessagesUpsert({ socket, messages });
    }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });

  socket.ev.on("group-participants.update", async (data) => {
    setTimeout(() => {
      try {
        onGroupParticipantsUpdate({ socket, groupParticipantsUpdate: data });
      } catch (error) {
        console.error(error);
      }
    }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });
};
