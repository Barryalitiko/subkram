const path = require("path");

exports.PREFIX = "#";

exports.COMMANDS_DIR = path.join(__dirname, "comandos");

exports.TEMP_DIR = path.resolve(__dirname, "..", "assets", "temp");

exports.TIMEOUT_IN_MILLISECONDS_BY_EVENT = 700;

exports.BOT_EMOJI = "༎OM༎";

exports.BASE_API_URL = "http://localhost:4000"; // URL base de la API