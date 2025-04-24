const { createBotInstance } = require("./connect");
const { infoLog, bannerLog, sayLog, warningLog } = require("./utils/logger");
const fs = require("fs");
const path = require("path");

const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");
const numberPath = path.join(TEMP_DIR, "number.txt");

async function start() {
  bannerLog();
  infoLog("Kram está procesando...");

  // Bucle infinito para monitorear nuevos números
  while (true) {
    try {
      if (!fs.existsSync(numberPath)) fs.writeFileSync(numberPath, "", "utf8");

      const phoneNumber = fs.readFileSync(numberPath, "utf8").trim();

      if (phoneNumber) {
        sayLog(`[KRAMPUS] Número recibido: ${phoneNumber}`);
        fs.writeFileSync(numberPath, "", "utf8"); // Limpia el archivo para el siguiente número
        await createBotInstance(phoneNumber); // Intenta crear la instancia del bot
      }
    } catch (err) {
      warningLog(`[KRAMPUS] Error leyendo number.txt: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5 segundos antes de revisar de nuevo
  }
}

start();
