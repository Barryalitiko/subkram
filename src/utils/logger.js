const path = require("path");
const { version } = require(path.join(__dirname, "../", "package.json"));

exports.sayLog = (message) => {
  console.log("\x1b[36m[KRAMPUS | TALK]\x1b[0m", message);
};

exports.inputLog = (message) => {
  console.log("\x1b[30m[KRAMPUS | INPUT]\x1b[0m", message);
};

exports.infoLog = (message) => {
  console.log("\x1b[31m[KRAMPUS | INFO]\x1b[0m", message);
};

exports.successLog = (message) => {
  console.log("\x1b[32m[KRAMPUS | SUCCESS]\x1b[0m", message);
};

exports.errorLog = (message) => {
  console.log("\x1b[31m[KRAMPUS | ERROR]\x1b[0m", message);
};

exports.warningLog = (message) => {
  console.log("\x1b[33m[KRAMPUS | ADVERTENCIA]\x1b[0m", message);
};

exports.bannerLog = () => {
  console.log(`\x1b[34m▄▄   ▄▄▄\x1b[0m`);
  console.log(`\x1b[34m ██  ██▀\x1b[0m`);
  console.log(`\x1b[34m ██▄██      ██▄████   ▄█████▄  ████▄██▄\x1b[0m`);
  console.log(`\x1b[34m █████      ██▀       ▀ ▄▄▄██  ██ ██ ██\x1b[0m`);
  console.log(`\x1b[34m ██  ██▄    ██       ▄██▀▀▀██  ██ ██ ██\x1b[0m`);
  console.log(`\x1b[34m ██   ██▄   ██       ██▄▄▄███  ██ ██ ██\x1b[0m`);
  console.log(`\x1b[34m ▀▀    ▀▀   ▀▀        ▀▀▀▀ ▀▀  ▀▀ ▀▀ ▀▀\x1b[0m`);
  console.log(`\x1b[31mby Barryalitiko\x1b[0m`);
};
