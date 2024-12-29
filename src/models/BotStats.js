const mongoose = require("mongoose");

const BotStatsSchema = new mongoose.Schema({
  totalMessages: {
    type: Number,
    default: 0,
  },
  totalErrors: {
    type: Number,
    default: 0,
  },
  commandsUsage: {
    type: Map,
    of: Number, // Guardará el número de veces que se ha usado cada comando
    default: {},
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Modelo para interactuar con la base de datos
const BotStats = mongoose.model("BotStats", BotStatsSchema);

module.exports = BotStats;