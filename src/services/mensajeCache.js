const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../assets/mensajeCache.json");

// Inicializar el archivo si no existe
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}));
}

// Cargar los mensajes almacenados
const loadMessages = () => {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
};

// Guardar mensajes en el archivo
const saveMessages = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Agregar un mensaje al grupo correspondiente
const addMessage = (groupId, message) => {
  const data = loadMessages();

  if (!data[groupId]) {
    data[groupId] = [];
  }

  // Agregar el mensaje y controlar el límite de 100
  data[groupId].push(message);
  if (data[groupId].length > 100) {
    data[groupId].splice(0, data[groupId].length - 100); // Eliminar mensajes más antiguos
  }

  saveMessages(data);
};

// Obtener los últimos mensajes borrados
const getDeletedMessages = (groupId) => {
  const data = loadMessages();
  return data[groupId] ? data[groupId].slice(-6) : [];
};

module.exports = {
  addMessage,
  getDeletedMessages,
};