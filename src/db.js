const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/krampusBot", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB", error);
    process.exit(1); // Salir si no puede conectar
  }
};

module.exports = connectDB;