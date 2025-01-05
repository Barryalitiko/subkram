const mongoose = require("mongoose");

// Crear un esquema para registrar eventos de los comandos
const commandUsageSchema = new mongoose.Schema({
  command: String,
  timestamp: { type: Date, default: Date.now },
  groupId: String,
  userId: String,
});

const groupStatsSchema = new mongoose.Schema({
  groupId: String,
  usersJoined: { type: Number, default: 0 },
  usersLeft: { type: Number, default: 0 },
  totalMembers: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

// Modelos
const CommandUsage = mongoose.model("CommandUsage", commandUsageSchema);
const GroupStats = mongoose.model("GroupStats", groupStatsSchema);

// Función para registrar el uso de un comando
async function logCommandUsage(command, groupId, userId) {
  const newCommandUsage = new CommandUsage({
    command,
    groupId,
    userId,
  });
  await newCommandUsage.save();
}

// Función para registrar estadísticas del grupo
async function logGroupStats(groupId, members, newJoins, newLeaves) {
  const newGroupStats = new GroupStats({
    groupId,
    usersJoined: newJoins,
    usersLeft: newLeaves,
    totalMembers: members,
  });
  await newGroupStats.save();
}

// Obtener estadísticas
async function getGroupStats(groupId) {
  return await GroupStats.find({ groupId }).sort({ date: -1 }).limit(1);
}

module.exports = {
  logCommandUsage,
  logGroupStats,
  getGroupStats,
};