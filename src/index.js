const { connectSubbot } = require("./connect");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");

    const socket = await connectSubbot("tuNumeroAqui"); // Asegúrate de pasar el número

    load(socket);
  } catch (error) {
    console.log(error);
  }
}

start();
