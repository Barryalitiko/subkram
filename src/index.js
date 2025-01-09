const { connect } = require("./src/connects");
const { load } = require("./src/loader");
const { infoLog, bannerLog } = require("./src/utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Krampus se está iniciando...");

    const socket = await connect();

    load(socket);
  } catch (error) {
    console.log(error);
  }
}

start();
