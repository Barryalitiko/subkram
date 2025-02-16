const { connect } = require("./subbot-connect");
const { load } = require("./subbot-loader");
const { infoLog, bannerLog } = require("./utils/logger");
const subbots = require("./subbots");

async function start() {
  try {
    bannerLog();
    infoLog("Subbots están procesando...");
    Object.keys(subbots).forEach((subbotName) => {
      const subbotConfig = subbots.getSubbot(subbotName);
      const socket = await connect(subbotConfig);
      load(socket, subbotConfig);
    });
  } catch (error) {
    console.log(error);
  }
}

start();






