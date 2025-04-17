const { connect } = require("./connect");
const { infoLog, bannerLog } = require("./utils/logger");

async function start() {
  try {
    bannerLog();
    infoLog("Kram está procesando...");
    await connect();
  } catch (error) {
    console.log(error);
  }
}

start();
