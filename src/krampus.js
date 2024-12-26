const path = require("path");

exports.PREFIX = "#";  

exports.COMMANDS_DIR = path.join(__dirname, "comandos");

exports.TEMP_DIR = path.resolve(__dirname, "..", "assets", "temp");

exports.TIMEOUT_IN_MILLISECONDS_BY_EVENT = 700;
