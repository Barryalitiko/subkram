const { connect } = require("./connect");
const { infoLog, bannerLog, warningLog, successLog } = require("./utils/logger");
const path = require("path");
const fs = require("fs");

// Guardamos las conexiones activas
const activeConnections = new Map();

// Duración máxima para esperar conexión (en milisegundos)
const TIMEOUT_LIMIT = 5 * 60 * 1000; // 5 minutos

// Ruta a number_queue.txt
const numberQueuePath = path.resolve(__dirname, "..", "temp", "number_queue.txt");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");

    // Conectar el primer connect (principal)
    const mainConnect = await connect();
    activeConnections.set("main", mainConnect);

    // Empezar a vigilar nuevos números
    watchNumberQueue();
  } catch (error) {
    console.error(error);
  }
}

// Vigila constantemente el number_queue.txt
function watchNumberQueue() {
  setInterval(async () => {
    try {
      if (!fs.existsSync(numberQueuePath)) {
        fs.writeFileSync(numberQueuePath, "", "utf8");
      }

      const queue = fs.readFileSync(numberQueuePath, "utf8").trim().split("\n").filter(Boolean);

      if (queue.length > 0) {
        const newNumber = queue.shift();

        // Actualiza el archivo removiendo el número ya capturado
        fs.writeFileSync(numberQueuePath, queue.join("\n"), "utf8");

        warningLog(`[KRAMPUS] Nuevo número detectado: ${newNumber}`);
        
        // Crear una nueva instancia de connect
        const connectInstance = await connect(newNumber);
        const id = Date.now(); // Un ID único para esta conexión

        activeConnections.set(id, connectInstance);

        // Establecer timeout para desconexión automática si no conecta
        setTimeout(() => {
          if (activeConnections.has(id)) {
            warningLog(`[KRAMPUS] La conexión de ${newNumber} no se estableció a tiempo. Cancelando...`);
            activeConnections.delete(id);
          }
        }, TIMEOUT_LIMIT);
      }
    } catch (err) {
      console.error("[KRAMPUS] Error vigilando número:", err);
    }
  }, 5000); // Cada 5 segundos
}

start();
