const { connect } = require("./connect");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");

    const sockets = await connect();
    sockets.forEach((socket) => load(socket));
  } catch (error) {
    console.log(error);
  }
}

start();