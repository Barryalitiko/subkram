const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "krampus-bot";

// Función para conectar a la base de datos
async function connectDB() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log("Conectado a MongoDB");
  return client.db(dbName);
}

// Función para registrar el uso de comandos
async function logCommandUsage(command, groupId, userId) {
  const db = await connectDB();
  const collection = db.collection("commandUsage");
  const newCommandUsage = { command, groupId, userId, timestamp: new Date() };
  await collection.insertOne(newCommandUsage);
}

// Función para registrar estadísticas del grupo
async function logGroupStats(groupId, members, newJoins, newLeaves) {
  const db = await connectDB();
  const collection = db.collection("groupStats");
  const newGroupStats = {
    groupId,
    usersJoined: newJoins,
    usersLeft: newLeaves,
    totalMembers: members,
    date: new Date(),
  };
  await collection.insertOne(newGroupStats);
}

// Obtener estadísticas
async function getGroupStats(groupId) {
  const db = await connectDB();
  const collection = db.collection("groupStats");
  const stats = await collection.find({ groupId }).sort({ date: -1 }).limit(1).toArray();
  return stats[0]; // Devolvemos el último registro de estadísticas
}

module.exports = {
  logCommandUsage,
  logGroupStats,
  getGroupStats,
};